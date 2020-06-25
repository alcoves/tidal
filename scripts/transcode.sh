#!/bin/bash
set -e

S3_IN=$1
S3_OUT=$2
FFMPEG_COMMAND=$3

echo "S3_IN: ${S3_IN}"
echo "S3_OUT: ${S3_OUT}"
echo "FFMPEG_COMMAND: ${FFMPEG_COMMAND}"

echo "creating signed source url"
SIGNED_SOURCE_URL=$(aws s3 presign $S3_IN)

echo "parsing variables"
VIDEO_ID="$(echo $S3_OUT | cut -d'/' -f5)"  
PRESET_NAME="$(echo $S3_OUT | cut -d'/' -f6)"
SEGMENT_NAME="$(echo $S3_OUT | cut -d'/' -f7)"

echo "VIDEO_ID: ${VIDEO_ID}"
echo "PRESET_NAME: ${PRESET_NAME}"
echo "SEGMENT_NAME: ${SEGMENT_NAME}"

echo "creating tmp file"
TMP_VIDEO_PATH=$(mktemp --suffix=.${SEGMENT_NAME})

echo "transcoding started"
ffmpeg -y -i "$SIGNED_SOURCE_URL" $FFMPEG_COMMAND $TMP_VIDEO_PATH

echo "moving transcode to s3"
aws s3 mv $TMP_VIDEO_PATH $S3_OUT

# echo "updating tidal database with status"
# aws dynamodb update-item \
#   --table-name tidal-dev \
#   --update-expression 'SET #segments.#segName = :status' \
#   --expression-attribute-values '{":status":{"BOOL":true}}' \
#   --key '{"id": {"S": '\"$VIDEO_ID\"'}, "preset": {"S": '\"$PRESET_NAME\"'}}' \
#   --expression-attribute-names '{"#segName":'\"$SEGMENT_NAME\"',"#segments":"segments"}'

echo "transcoding completed"