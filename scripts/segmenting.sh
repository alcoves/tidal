#!/bin/bash
set -e

S3_IN=$1
S3_OUT=$2
FFMPEG_COMMAND=$3

echo "S3_IN: ${S3_IN}"
echo "S3_OUT: ${S3_OUT}"
echo "FFMPEG_COMMAND: ${FFMPEG_COMMAND}"

echo "creating tmp directory"
TMP_DIR=$(mktemp -d)
TMP_SEGMENT_DIR=$TMP_DIR/segments
mkdir $TMP_SEGMENT_DIR

VIDEO_EXTENSION="${S3_IN##*.}"
echo "VIDEO_EXTENSION: ${VIDEO_EXTENSION}"

VIDEO_PATH="$TMP_DIR/${VIDEO_ID}.${VIDEO_EXTENSION}"
echo "VIDEO_PATH: ${VIDEO_PATH}"

echo "parsing variables"
VIDEO_ID="$(echo $S3_OUT | cut -d'/' -f5)"  
PRESET_NAME="$(echo $S3_OUT | cut -d'/' -f6)"
SEGMENT_NAME="$(echo $S3_OUT | cut -d'/' -f7)"

BUCKET="$(echo $S3_IN | cut -d'/' -f3)"
echo "BUCKET: ${BUCKET}"

TIDAL_ENV="$(echo $BUCKET | cut -d'-' -f3)"
echo "TIDAL_ENV: ${TIDAL_ENV}"

echo "VIDEO_ID: ${VIDEO_ID}"
echo "PRESET_NAME: ${PRESET_NAME}"
echo "SEGMENT_NAME: ${SEGMENT_NAME}"

echo "downloading video"
aws s3 cp $S3_IN $VIDEO_PATH

echo "segmentation started"
ffmpeg -y -i $VIDEO_PATH $FFMPEG_COMMAND $TMP_SEGMENT_DIR/%08d.$VIDEO_EXTENSION

echo "tally segments"
SEGMENT_COUNT=$(ls -1q $TMP_SEGMENT_DIR | wc -l)

echo "moving segments to s3"
aws s3 sync $TMP_SEGMENT_DIR $S3_OUT

echo "removing tmp dir"
rm -rf $TMP_DIR

echo "Updating tidal db"
aws dynamodb update-item \
  --table-name "tidal-${TIDAL_ENV}" \
  --key '{"id": {"S": '\"$VIDEO_ID\"'}}' \
  --update-expression "SET segmentCount = :segmentCount" \
  --expression-attribute-values '{":segmentCount":{"N":'\"$SEGMENT_COUNT\"'}}'

echo "segmentation completed"