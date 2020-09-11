#!/bin/bash
set -e

IN_PATH=$1
OUT_PATH=$2

BUCKET="$(echo $IN_PATH | cut -d'/' -f3)"
echo "BUCKET: ${BUCKET}"

VIDEO_ID="$(echo $IN_PATH | cut -d'/' -f5)"
echo "VIDEO_ID: ${VIDEO_ID}"

PRESET_NAME="$(echo $IN_PATH | cut -d'/' -f6)"
echo "PRESET_NAME: ${PRESET_NAME}"

VIDEO_EXTENSION="${OUT_PATH##*.}"
echo "VIDEO_EXTENSION: ${VIDEO_EXTENSION}"

echo "creating tmp dir"
TMP_DIR=$(mktemp -d)
mkdir $TMP_DIR/audio
mkdir $TMP_DIR/segments
echo "TMP_DIR: $TMP_DIR"

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

AUDIO_PATH="${TMP_DIR}/audio/source.wav"
echo "AUDIO_PATH: $AUDIO_PATH"

echo "downloading audio"
aws s3 cp \
  s3://${BUCKET}/audio/${VIDEO_ID}/source.${AUDIO_EXT} \
  $AUDIO_PATH \ 
  --profile digitalocean \ 
  --endpoint=https://nyc3.digitaloceanspaces.com

echo "concatinating started"
# -hide_banner -loglevel panic
ffmpeg -y -f concat -safe 0 \
  -i $MANIFEST \
  -c copy \
  -f matroska - | \
  ffmpeg \
  -y -i - \
  -i $AUDIO_PATH \
  -c:v copy \
  -movflags faststart \
  $TMP_VIDEO_PATH

echo "copying to wasabi"
aws s3 mv $TMP_VIDEO_PATH $OUT_PATH \
  --profile wasabi \
  --content-type "video/$VIDEO_EXTENSION" \
  --endpoint=https://us-east-2.wasabisys.com

echo "removing tmp dir"
rm -rf $TMP_DIR