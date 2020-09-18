#!/bin/bash
set -e

echo "starting video conversion process"

S3_IN=$1

BUCKET="$(echo $S3_IN | cut -d'/' -f3)"  
echo "BUCKET: ${BUCKET}"

VIDEO_ID="$(echo $S3_IN | cut -d'/' -f4)"  
echo "VIDEO_ID: ${VIDEO_ID}"

VIDEO_EXTENSION="${S3_IN##*.}"
echo "VIDEO_EXTENSION: ${VIDEO_EXTENSION}"

echo "cleaing up s3"
aws s3 rm \
  s3://${BUCKET}/${VIDEO_ID}/versions \
  --recursive \
  --profile digitalocean \
  --endpoint=https://nyc3.digitaloceanspaces.com

aws s3 rm \
  s3://${BUCKET}/${VIDEO_ID}/segments \
  --recursive \
  --profile digitalocean \
  --endpoint=https://nyc3.digitaloceanspaces.com

aws s3 rm \
  s3://${BUCKET}/${VIDEO_ID}/source.wav \
  --profile digitalocean \
  --endpoint=https://nyc3.digitaloceanspaces.com

URL=$(aws s3 presign "$S3_IN" --profile digitalocean --endpoint=https://nyc3.digitaloceanspaces.com)
echo "URL: $URL"

echo "creating tmp dir"
TMP_DIR=$(mktemp -d)

echo "getting presets"
PRESETS=$(node /root/tidal/src/services/getPresets.js "$URL" | jq -r '.presets')

echo "splitting source audio"
HAS_AUDIO=$(ffprobe -i "$URL" -show_streams -select_streams a -of json -loglevel error)
AUDIO_STREAM_LENGTH=$(echo $HAS_AUDIO | jq -r '.streams | length')

if [ "$AUDIO_STREAM_LENGTH" -gt 0 ]; then
  echo "has audio"
  AUDIO_PATH="${TMP_DIR}/source.wav"

  echo "exporting source.wav"
  ffmpeg -i "$URL" -vn $AUDIO_PATH
  
  echo "uploading"
  aws s3 cp \
    $AUDIO_PATH \
    s3://${BUCKET}/${VIDEO_ID}/source.wav \
    --profile digitalocean \
    --endpoint=https://nyc3.digitaloceanspaces.com

  rm $AUDIO_PATH
else
  echo "video does not contain audio"
fi

echo "segmenting video"
SEGMENT_TMP_DIR=$TMP_DIR/segments
mkdir -p $SEGMENT_TMP_DIR
ffmpeg -i "$URL" -an -c:v copy -f segment -segment_time 10 $SEGMENT_TMP_DIR/%08d.${VIDEO_EXTENSION}

echo "uploading segments"
aws s3 cp \
  $SEGMENT_TMP_DIR \
  s3://${BUCKET}/${VIDEO_ID}/segments \
  --recursive \
  --profile digitalocean \
  --endpoint=https://nyc3.digitaloceanspaces.com

# Causes off by one error
# echo "placing initial preset directories"
# for row in $(echo "$PRESETS" | jq -r '.[] | @base64'); do
#   PRESET=$(echo ${row} | base64 --decode | jq -r '.')
#   PRESET_NAME=$(echo $PRESET | jq -r '.preset')

#   aws s3api put-object \
#     --bucket ${BUCKET} \
#     --profile digitalocean \
#     --key ${VIDEO_ID}/versions/${PRESET_NAME}/ \
#     --endpoint=https://nyc3.digitaloceanspaces.com
# done

echo "dispatching transcoding jobs"
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
      -meta s3_in="s3://${BUCKET}/${VIDEO_ID}/segments/${SEGMENT}" \
      -meta s3_out="s3://${BUCKET}/${VIDEO_ID}/versions/${PRESET_NAME}/${SEGMENT}" \
      transcoding
  done
done

echo "removing tmp dir"
rm -rf $TMP_DIR

echo "done!"