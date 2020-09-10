#!/bin/bash
set -e

echo "NOMAD_TOKEN: $NOMAD_TOKEN"

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
PRESETS=$(node /root/tidal/src/services/getPresets.js "$URL" | jq -r '.presets')

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
  CMD=$(echo $PRESET | jq -r '.cmd')
  PRESET_NAME=$(echo $PRESET | jq -r '.preset')

  for SEGMENT in $(ls $SEGMENT_TMP_DIR); do
    nomad job dispatch \
      -meta cmd="$CMD" \
      -meta s3_in="s3://tidal-bken/segments/${VIDEO_ID}/source/${SEGMENT}" \
      -meta s3_out="s3://tidal-bken/segments/${VIDEO_ID}/${PRESET_NAME}/${SEGMENT}" \
      transcoding
  done
done

echo "removing tmp dir"
rm -rf $TMP_DIR

echo "done!"