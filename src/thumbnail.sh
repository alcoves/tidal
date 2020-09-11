#!/bin/bash
set -e

IN_PATH=$1
OUT_PATH=$2
CMD=$3

BUCKET="$(echo $IN_PATH | cut -d'/' -f3)"
echo "BUCKET: ${BUCKET}"

VIDEO_ID="$(echo $IN_PATH | cut -d'/' -f5)"
echo "VIDEO_ID: ${VIDEO_ID}"

WASABI_BUCKET="$(echo $OUT_PATH | cut -d'/' -f3)"
echo "WASABI_BUCKET: ${WASABI_BUCKET}"

FILENAME=$(basename -- "$OUT_PATH")
EXTENSION="${FILENAME##*.}"
FILENAME="${FILENAME%.*}"
echo "FILENAME: $FILENAME"
echo "EXTENSION: $EXTENSION"

echo "creating signed url"
SIGNED_URL=$(aws s3 presign $IN_PATH --profile digitalocean --endpoint=https://nyc3.digitaloceanspaces.com)

echo "creating tmp dir"
TMP_DIR=$(mktemp -d)

echo "picture path"
THUMB_PATH="${TMP_DIR}/${VIDEO_ID}.${EXTENSION}"

echo "calling ffmpeg"
ffmpeg -y -i "$SIGNED_URL" $CMD $THUMB_PATH

echo "get thumbnail mime type"
MIME_TYPE=$(file --mime-type $THUMB_PATH)

echo "copying to wasabi"
aws s3 mv $THUMB_PATH $OUT_PATH \
  --profile wasabi --content-type $MIME_TYPE \
  --endpoint=https://us-east-2.wasabisys.com

echo "cleaning up tmp dir"
rm -rf $TMP_DIR

echo "done!"
