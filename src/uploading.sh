#!/bin/bash
set -e

echo "starting video conversion process"

S3_IN=$1

BUCKET="$(echo $S3_IN | cut -d'/' -f3)"  
echo "BUCKET: ${BUCKET}"

VIDEO_ID="$(echo $S3_IN | cut -d'/' -f5)"  
echo "VIDEO_ID: ${VIDEO_ID}"

VIDEO_EXTENSION="${S3_IN##*.}"
echo "VIDEO_EXTENSION: ${VIDEO_EXTENSION}"

echo "cleaing up s3"
aws s3 rm \
  s3://${BUCKET}/segments/${VIDEO_ID}/ \
  --recursive \
  --profile digitalocean \
  --endpoint=https://nyc3.digitaloceanspaces.com

URL=$(aws s3 presign "$S3_IN" --profile digitalocean --endpoint=https://nyc3.digitaloceanspaces.com)
echo "URL: $URL"

echo "creating tmp dir"
TMP_DIR=$(mktemp -d)

echo "getting presets"
PRESETS=$(node /root/tidal/src/services/getPresets.js "$URL" | jq -r '.presets')

echo "splitting source audio"
ffmpeg -i "$URL" -vn ${TMP_DIR}/source.wav || touch ${TMP_DIR}/source.wav
aws s3 mv \
  ${TMP_DIR}/source.wav \
  s3://${BUCKET}/audio/source.wav \
  --recursive \
  --profile digitalocean \
  --endpoint=https://nyc3.digitaloceanspaces.com

echo "segmenting video"
SEGMENT_TMP_DIR=$TMP_DIR/segments
mkdir -p $SEGMENT_TMP_DIR
ffmpeg -i "$URL" -an -c:v copy -f segment -segment_time 10 $SEGMENT_TMP_DIR/%08d.${VIDEO_EXTENSION}

echo "uploading segments"
aws s3 cp \
  $SEGMENT_TMP_DIR \
  s3://${BUCKET}/segments/${VIDEO_ID}/source/ \
  --recursive \
  --profile digitalocean \
  --endpoint=https://nyc3.digitaloceanspaces.com

for row in $(echo "$PRESETS" | jq -r '.[] | @base64'); do
  PRESET=$(echo ${row} | base64 --decode | jq -r '.')
  CMD=$(echo $PRESET | jq -r '.cmd')
  PRESET_NAME=$(echo $PRESET | jq -r '.preset')

  echo "putting consul kv"
  consul kv put tidal/${VIDEO_ID}/${PRESET_NAME} $VIDEO_ID/$PRESET_NAME

  for SEGMENT in $(ls $SEGMENT_TMP_DIR); do
    nomad job dispatch \
      -detach \
      -meta cmd="$CMD" \
      -meta s3_in="s3://${BUCKET}/segments/${VIDEO_ID}/source/${SEGMENT}" \
      -meta s3_out="s3://${BUCKET}/segments/${VIDEO_ID}/${PRESET_NAME}/${SEGMENT}" \
      transcoding
  done
done

echo "removing tmp dir"
rm -rf $TMP_DIR

echo "done!"