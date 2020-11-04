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

echo "creating tmp dir"
TMP_DIR=$(mktemp -d)
mkdir $TMP_DIR/audio
mkdir $TMP_DIR/segments
mkdir $TMP_DIR/hls
echo "TMP_DIR: $TMP_DIR"

TMP_HLS_PATH="$TMP_DIR/hls"
mkdir $TMP_HLS_PATH/$PRESET_NAME
echo "TMP_HLS_PATH: $TMP_HLS_PATH"

TMP_HLS_PLAYLISTS="$TMP_DIR/playlists"
mkdir $TMP_HLS_PLAYLISTS
echo "TMP_HLS_PLAYLISTS: $TMP_HLS_PLAYLISTS"

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

echo "getting all preset master playlists"
aws s3 cp s3://cdn.bken.io/v/${VIDEO_ID}/hls/ $TMP_HLS_PATH/ \
  --recursive \
  --exclude "*.ts" \
  --include "*.m3u8" \
  --profile wasabi \
  --endpoint=https://us-east-2.wasabisys.com

echo "removing master playlist if exists"
rm -f ${TMP_HLS_PATH}/master.m3u8

echo "creating concatinated video file"
CONCAT_VIDEO_PATH=$(mktemp --suffix=.ts)
ffmpeg -hide_banner -y \
  -f concat \
  -safe 0 \
  -c copy \
  $CONCAT_VIDEO_PATH
rm -rf $TMP_DIR/segments

echo "muxing audio and video"
CONCAT_VIDEO_WITH_AUDIO=$(mktemp --suffix=.ts)
ffmpeg -hide_banner -y \
  -i $CONCAT_VIDEO_PATH \
  $AUDIO_CMD \
  -c:v copy \
  $CONCAT_VIDEO_WITH_AUDIO
rm -f $CONCAT_VIDEO_PATH

echo "packaging for hls"
ffmpeg -hide_banner ffmpeg -y \
  -i $CONCAT_VIDEO_WITH_AUDIO
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
aws s3 cp $TMP_HLS_PATH s3://cdn.bken.io/v/${VIDEO_ID}/hls/ \
  --recursive \
  --profile wasabi \
  --endpoint=https://us-east-2.wasabisys.com

echo "removing tmp dir"
rm -rf $TMP_DIR
