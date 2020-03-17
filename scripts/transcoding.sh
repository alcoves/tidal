#!/bin/bash
set -e

echo "Setting env"
CMD=$1
PRESET=$2
BUCKET=$3
SEGMENT=$4
VIDEO_ID=$5

ls local/

VIDEO_INPUT_PATH="local/segment"
VIDEO_OUTPUT_PATH="local/${SEGMENT}-transcoded.mkv"

echo "Transcoding segment"
ffmpeg -i $VIDEO_INPUT_PATH -c:v libx264 -crf 22 -preset ultrafast -threads 1 $VIDEO_OUTPUT_PATH

echo "Uploading segment"
s3cmd put -c local/.s3cfg $VIDEO_OUTPUT_PATH s3://$BUCKET/transcoded-segments/$VIDEO_ID/$PRESET/$SEGMENT