#!/bin/bash
set -e

IN_PATH=$1
OUT_PATH=$2

BUCKET="$(echo $IN_PATH | cut -d'/' -f3)"
echo "BUCKET: ${BUCKET}"

VIDEO_ID="$(echo $IN_PATH | cut -d'/' -f4)"
echo "VIDEO_ID: ${VIDEO_ID}"

PRESET_NAME="$(echo $IN_PATH | cut -d'/' -f6)"
echo "PRESET_NAME: ${PRESET_NAME}"

VIDEO_EXTENSION="${OUT_PATH##*.}"
echo "VIDEO_EXTENSION: ${VIDEO_EXTENSION}"

echo "creating tmp dir"
TMP_DIR=$(mktemp -d)
mkdir $TMP_DIR/audio
mkdir $TMP_DIR/segments
mkdir $TMP_DIR/hls
echo "TMP_DIR: $TMP_DIR"

TMP_HLS_PATH="$TMP_DIR/hls"
mkdir $TMP_HLS_PATH/$PRESET_NAME
echo "TMP_HLS_PATH: $TMP_HLS_PATH"

TMP_VIDEO_PATH="${TMP_DIR}/${PRESET_NAME}.${VIDEO_EXTENSION}"
echo "TMP_VIDEO_PATH: $TMP_VIDEO_PATH"

echo "creating manifest"
MANIFEST=${TMP_DIR}/manifest.txt
touch $MANIFEST

echo "download segments"
aws s3 sync \
  $IN_PATH \
  $TMP_DIR/segments \
  --profile digitalocean \
  --endpoint=https://nyc3.digitaloceanspaces.com

for SEGMENT in $(ls $TMP_DIR/segments); do
  echo "file '${TMP_DIR}/segments/${SEGMENT}'" >> $MANIFEST
done

echo "downloading audio"
AUDIO_PATH_COUNT=$(aws s3 ls s3://${BUCKET}/${VIDEO_ID}/audio.wav --profile digitalocean --endpoint=https://nyc3.digitaloceanspaces.com | wc -l)

if [ "$AUDIO_PATH_COUNT" -gt 0 ]; then
  echo "has audio"
  AUDIO_PATH="${TMP_DIR}/audio/audio.wav"
  echo "AUDIO_PATH: $AUDIO_PATH"

  echo "downloading audio"
  aws s3 cp \
    s3://${BUCKET}/${VIDEO_ID}/audio.wav \
    $AUDIO_PATH \
    --profile digitalocean \
    --endpoint=https://nyc3.digitaloceanspaces.com

  AUDIO_CMD="-i ${AUDIO_PATH}"
else
  echo "video does not contain audio"
  AUDIO_CMD=""
fi

echo "concatinating started"
# -hide_banner -loglevel panic
ffmpeg -hide_banner -y -f concat -safe 0 \
  -i $MANIFEST \
  -c copy \
  -f matroska - | \
  ffmpeg \
  -y -i - \
  $AUDIO_CMD \
  -c:v copy \
  -movflags faststart \
  $TMP_VIDEO_PATH

echo "getting all preset master playlists"
aws s3 cp s3://cdn.bken.io/v/${VIDEO_ID}/hls/ $TMP_HLS_PATH/ \
  --recursive \
  --profile wasabi \
  --include "*.m3u8" \
  --exclude "*.ts" \
  --endpoint=https://us-east-2.wasabisys.com

echo "removing master playlist if exists"
rm -f ${TMP_HLS_PATH}/master.m3u8

echo "packaging for hls"
ffmpeg -y -i $TMP_VIDEO_PATH \
  -c copy \
  -hls_time 2 \
  -hls_allow_cache 1 \
  -hls_playlist_type vod \
  -hls_base_url "./${PRESET_NAME}/" \
  -master_pl_name ${PRESET_NAME}-master.m3u8 \
  -hls_segment_filename ${TMP_HLS_PATH}/${PRESET_NAME}/%d.ts \
  ${TMP_HLS_PATH}/${PRESET_NAME}.m3u8

echo "creating master playlist"
HLS_MASTER="${TMP_HLS_PATH}/master.m3u8"
touch $HLS_MASTER
echo "#EXTM3U" >> $HLS_MASTER
echo "#EXT-X-VERSION:3" >> $HLS_MASTER

PRESET_MASTERS=$(ls $TMP_HLS_PATH/*-master.m3u8)
for PLAYLIST in $PRESET_MASTERS; do
  echo "appending master playlist from $PLAYLIST"
  HLS_PRESET_MASTER_ADDITION=$(tail -n 3 $PLAYLIST | grep -v -e '^$')
  echo "$HLS_PRESET_MASTER_ADDITION" >> $HLS_MASTER
done;

echo "copying hls data to wasabi"
aws s3 cp $TMP_HLS_PATH s3://cdn.bken.io/v/${VIDEO_ID} \
  --recursive \
  --profile wasabi \
  --endpoint=https://us-east-2.wasabisys.com

echo "removing tmp dir"
rm -rf $TMP_DIR
