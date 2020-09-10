#!/bin/bash
set -e

echo "starting video conversion process"

S3_IN=$1

VIDEO_ID="$(echo $S3_IN | cut -d'/' -f5)"  
echo "VIDEO_ID: ${VIDEO_ID}"

VIDEO_EXTENSION="${S3_IN##*.}"
echo "VIDEO_EXTENSION: ${VIDEO_EXTENSION}"

URL=$(aws s3 presign "$S3_IN" --profile digitalocean --endpoint=https://nyc3.digitaloceanspaces.com)
echo "URL: $URL"

echo "creating tmp dir"
TMP_DIR=$(mktemp -d)

echo "getting presets"
PRESETS=$(node services/getPresets.js "$URL" | jq -r '.presets')

echo "segmenting video"
SEGMENT_TMP_DIR=$TMP_DIR/segments
mkdir -p $SEGMENT_TMP_DIR
ffmpeg -i "$URL" -an -c:v copy -f segment -segment_time 10 $SEGMENT_TMP_DIR/%08d.${VIDEO_EXTENSION}

echo "uploading segments"
aws s3 cp \
  $SEGMENT_TMP_DIR \
  s3://tidal/segments/${VIDEO_ID}/source/ \
  --recursive \
  --profile digitalocean \
  --endpoint=https://nyc3.digitaloceanspaces.com

for row in $(echo "$PRESETS" | jq -r '.[] | @base64'); do
  PRESET=$(echo ${row} | base64 --decode | jq -r '.')

  EXT=$(echo $PRESET | jq -r '.ext')
  CMD=$(echo $PRESET | jq -r '.cmd')
  PRESET_NAME=$(echo $PRESET | jq -r '.preset')
  VIDEO_PATH=${TMP}/${PRESET_NAME}.${EXT}

  nomad job dispatch \
    -meta s3_in=s3://tidal-bken/source/test/source.mp4 \
    -meta cmd='-an -c:v copy -f segment -segment_time 10' \
    transcoding

  # ffmpeg -i "$URL" $CMD $VIDEO_PATH
  # aws s3 cp $VIDEO_PATH s3://cdn.bken.io/v/${VIDEO_ID}/${PRESET_NAME}.${EXT} --profile wasabi --endpoint=https://us-east-2.wasabisys.com

done

echo "removing tmp dir"
rm -rf $TMP_DIR

echo "done!"