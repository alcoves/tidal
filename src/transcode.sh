#!/bin/bash
set -e

S3_IN=$1
S3_OUT=$2
FFMPEG_COMMAND=$3
TIDAL_PATH=${4:-"/root/tidal"}

echo "S3_IN: ${S3_IN}"
echo "S3_OUT: ${S3_OUT}"
echo "FFMPEG_COMMAND: ${FFMPEG_COMMAND}"

echo "parsing variables"
BUCKET="$(echo $S3_OUT | cut -d'/' -f3)"
VIDEO_ID="$(echo $S3_OUT | cut -d'/' -f4)"
PRESET_NAME="$(echo $S3_OUT | cut -d'/' -f6)"
SEGMENT_NAME="$(echo $S3_OUT | cut -d'/' -f8)"

echo "creating tmp dir"
TMP_DIR=$(mktemp -d)
echo "TMP_DIR: $TMP_DIR"

echo "downloading source segment"
aws s3 cp $S3_IN $TMP_DIR \
  --quiet \
  --profile digitalocean \
  --endpoint=https://nyc3.digitaloceanspaces.com
SOURCE_SEGMENT=$(ls $TMP_DIR/*)

# Variables are exported because consul lock produces a child script
export LOCK_KEY="tidal/${VIDEO_ID}/${PRESET_NAME}"
export CONCAT_S3_IN="s3://${BUCKET}/${VIDEO_ID}/versions/${PRESET_NAME}/segments"
export CONCAT_S3_OUT="s3://cdn.bken.io/v/${VIDEO_ID}/${PRESET_NAME}.mp4"

echo "BUCKET: ${BUCKET}"
echo "VIDEO_ID: ${VIDEO_ID}"
echo "PRESET_NAME: ${PRESET_NAME}"
echo "SEGMENT_NAME: ${SEGMENT_NAME}"

echo "creating tmp file"
TRANSCODED_SEGMENT= "$TMP_DIR/transcoded-$SEGMENT_NAME"

echo "transcoding started"
ffmpeg -y -i $SOURCE_SEGMENT $FFMPEG_COMMAND $TRANSCODED_SEGMENT

echo "moving transcode to s3"
aws s3 cp $TRANSCODED_SEGMENT $S3_OUT \
  --quiet \
  --profile digitalocean \
  --endpoint=https://nyc3.digitaloceanspaces.com

echo "counting source segments"
SOURCE_SEGMENTS_COUNT=$(aws s3 ls s3://${BUCKET}/${VIDEO_ID}/segments/ --profile digitalocean --endpoint=https://nyc3.digitaloceanspaces.com | wc -l)

echo "counting transcoded segments"
TRANSCODED_SEGMENTS_COUNT=$(aws s3 ls s3://${BUCKET}/${VIDEO_ID}/versions/${PRESET_NAME}/segments/ --profile digitalocean --endpoint=https://nyc3.digitaloceanspaces.com | wc -l)
echo "segment count: expected ${SOURCE_SEGMENTS_COUNT} got ${TRANSCODED_SEGMENTS_COUNT}"

if [ "$SOURCE_SEGMENTS_COUNT" -eq "$TRANSCODED_SEGMENTS_COUNT" ]; then
  echo "ready for concat, aquiring lock"
  consul lock $LOCK_KEY $TIDAL_PATH/src/services/lockConcat.sh
fi

echo "removing $TMP_DIR"
rm -rf $TMP_DIR

echo "done!"
