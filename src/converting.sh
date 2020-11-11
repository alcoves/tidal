#!/bin/bash
set -e

echo "starting video conversion process"

S3_IN=$1
TIDAL_PATH=${2:-"/root/tidal"}
BENTO="/usr/local/bin/bento/bin"

echo "TIDAL_PATH: $TIDAL_PATH"
echo "BENTO: $BENTO"

BUCKET="$(echo $S3_IN | cut -d'/' -f3)"
echo "BUCKET: ${BUCKET}"

VIDEO_ID="$(echo $S3_IN | cut -d'/' -f4)"
echo "VIDEO_ID: ${VIDEO_ID}"

VIDEO_EXTENSION="${S3_IN##*.}"
echo "VIDEO_EXTENSION: ${VIDEO_EXTENSION}"

echo "cleaing up digitalocean"
aws s3 rm \
  s3://${BUCKET}/${VIDEO_ID} \
  --quiet \
  --recursive \
  --exclude "source.*" \
  --profile digitalocean \
  --endpoint=https://nyc3.digitaloceanspaces.com

echo "cleaing up wasabi"
aws s3 rm \
  s3://cdn.bken.io/v/${VIDEO_ID} \
  --quiet \
  --recursive \
  --profile wasabi \
  --endpoint=https://us-east-2.wasabisys.com

echo "downloading source video"
SOURCE_VIDEO_DIR=$(mktemp -d)
aws s3 cp $S3_IN $SOURCE_VIDEO_DIR/ \
  --quiet \
  --profile digitalocean \
  --endpoint=https://nyc3.digitaloceanspaces.com
SOURCE_VIDEO=$(ls $SOURCE_VIDEO_DIR)
SOURCE_VIDEO="$SOURCE_VIDEO_DIR/$SOURCE_VIDEO"
echo "SOURCE_VIDEO: $SOURCE_VIDEO"

echo "creating tmp dir"
TMP_DIR=$(mktemp -d)
echo "TMP_DIR: $TMP_DIR"

echo "getting presets"
PRESETS=$(node $TIDAL_PATH/src/services/getPresets.js "$SOURCE_VIDEO" | jq -r '.presets')

echo "dispatching transcoding jobs"
for row in $(echo "$PRESETS" | jq -r '.[] | @base64'); do
  PRESET=$(echo ${row} | base64 --decode | jq -r '.')
  CMD=$(echo $PRESET | jq -r '.cmd')
  PRESET_NAME=$(echo $PRESET | jq -r '.preset')

  echo "creating preset $PRESET_NAME"
  ffmpeg -hide_banner -y -i "$SOURCE_VIDEO" $CMD $TMP_DIR/$PRESET_NAME.mp4

  echo "creating hls segments"
  $BENTO/mp4hls -f -o $TMP_DIR/hls --master-playlist-name=master.m3u8 $TMP_DIR/*.mp4

  echo "uploading to cdn"
  aws s3 sync \
    $TMP_DIR \
    s3://cdn.bken.io/v/$VIDEO_ID/ \
    --quiet \
    --profile wasabi \
    --endpoint=https://us-east-2.wasabisys.com

  echo $PRESET_NAME
done

echo "removing tmp dirs"
rm -rf $TMP_DIR
rm -rf $SOURCE_VIDEO_DIR

echo "done!"
