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

# This doesn't work
VIDEO_EXTENSION="${OUT_PATH##*.}"
echo "VIDEO_EXTENSION: ${VIDEO_EXTENSION}"

echo "creating tmp dir"
TMP_DIR=$(mktemp -d)
mkdir -p $TMP_DIR/audio
mkdir -p $TMP_DIR/segments
mkdir -p $TMP_DIR/playlists
mkdir -p $TMP_DIR/$PRESET_NAME
echo "TMP_DIR: $TMP_DIR"

HLS_PRESETS="$TMP_DIR/playlists"
echo "HLS_PRESETS: $HLS_PRESETS"

TMP_VIDEO_PATH=$(mktemp --suffix=.${VIDEO_EXTENSION})
echo "TMP_VIDEO_PATH: $TMP_VIDEO_PATH"

echo "creating manifest"
MANIFEST=$(mktemp)

echo "download segments"
aws s3 sync \
  $IN_PATH \
  $TMP_DIR/segments \
  --quiet \
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
    --quiet \
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

echo "removing segments to save space"
rm -rf $TMP_DIR/segments

################### HLS Packaging ###################
BENTO="/usr/local/bin/bento/bin"
PACKAGING_PATH=$(mktemp -d)
mkdir -p $PACKAGING_PATH
cd $PACKAGING_PATH

echo "packaging for hls"
$BENTO/mp4hls --master-playlist-name preset_master.m3u8 $TMP_VIDEO_PATH

echo "fixing playlists"
mv output $VIDEO_ID
mv $VIDEO_ID/media-1 $VIDEO_ID/$PRESET_NAME

echo "fix paths in version master"
sed -i "s+media-1+${PRESET_NAME}+g" $VIDEO_ID/preset_master.m3u8
mv $VIDEO_ID/preset_master.m3u8 $VIDEO_ID/$PRESET_NAME/preset_master.m3u8

echo "fetching other standalone masters"
aws s3 cp s3://cdn.bken.io/v/$VIDEO_ID $HLS_PRESETS \
  --quiet \
  --recursive \
  --profile wasabi \
  --exclude "*.ts" \
  --include "*.m3u8" \
  --endpoint=https://us-east-2.wasabisys.com

mkdir -p $HLS_PRESETS/$PRESET_NAME
cp $VIDEO_ID/$PRESET_NAME/preset_master.m3u8 $HLS_PRESETS/$PRESET_NAME/master.m3u8

echo "create master playlist"
HLS_MASTER=$(mktemp)
echo "#EXTM3U" >> $HLS_MASTER
echo "#EXT-X-VERSION:4" >> $HLS_MASTER

for PLAYLIST in $(find $HLS_PRESETS -name 'preset_master.m3u8'); do
  echo "PLAYLIST: $PLAYLIST"
  PLAYLIST_ADDITION=$(tail -n 6 $PLAYLIST)
  echo "$PLAYLIST_ADDITION" >> $HLS_MASTER
done;

echo $(cat "$HLS_MASTER")

echo "copying hls preset to wasabi"
aws s3 cp $PACKAGING_PATH/$VIDEO_ID s3://cdn.bken.io/v/${VIDEO_ID} \
  --quiet \
  --recursive \
  --profile wasabi \
  --endpoint=https://us-east-2.wasabisys.com

echo "copying master to wasabi"
aws s3 cp $HLS_MASTER s3://cdn.bken.io/v/${VIDEO_ID}/master.m3u8 \
  --quiet \
  --profile wasabi \
  --endpoint=https://us-east-2.wasabisys.com

echo "removing tmp dir"
rm -rf $TMP_DIR