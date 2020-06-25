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

echo "creating tmp directory"
TMP_SEGMENT_DIR=$(mktemp -d)

echo "segmentation started"
ffmpeg -y -i "$SIGNED_SOURCE_URL" $FFMPEG_COMMAND $TMP_SEGMENT_DIR/%08d.mkv

echo "moving segments to s3"
aws s3 sync $TMP_SEGMENT_DIR $S3_OUT

echo "removing tmp segment dir"
rm -rf $TMP_SEGMENT_DIR

echo "segmentation completed"