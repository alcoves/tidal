#!/bin/bash
set -e

IN_PATH=$1
OUT_PATH=$2
FFMPEG_CMD=$3

echo "IN_PATH: $IN_PATH"
echo "OUT_PATH: $OUT_PATH"
echo "FFMPEG_CMD: $FFMPEG_CMD"

VIDEO_ID="$(echo $IN_PATH | cut -d'/' -f5)"
echo "VIDEO_ID: ${VIDEO_ID}"

FILENAME=$(basename -- "$OUT_PATH")
EXT="${FILENAME##*.}"
echo "FILENAME: ${FILENAME}"
echo "EXT: ${EXT}"

echo "creating tmpfile"
TMP_FILE=$(mktemp --suffix=.${EXT})

echo "creating signed source url"
SOURCE_URL=$(aws s3 presign $IN_PATH)

echo "in: $IN_PATH | out: $OUT_PATH"
# -hide_banner -loglevel panic
ffmpeg -y -i "$SOURCE_URL" $FFMPEG_CMD $TMP_FILE

echo "uploading audio file to s3"
aws s3 mv $TMP_FILE $OUT_PATH

echo "audio extraction completed"