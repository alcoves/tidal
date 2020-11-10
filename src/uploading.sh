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
  s3://cdn.bken.io/${VIDEO_ID} \
  --quiet \
  --recursive \
  --profile wasabi \
  --endpoint=https://us-east-2.wasabisys.com

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
  AUDIO_PATH="${TMP_DIR}/audio.wav"

  echo "exporting audio.wav"
  ffmpeg -i "$URL" -vn $AUDIO_PATH

  echo "uploading"
  aws s3 cp \
    $AUDIO_PATH \
    s3://${BUCKET}/${VIDEO_ID}/audio.wav \
    --quiet \
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
  --quiet \
  --recursive \
  --profile digitalocean \
  --endpoint=https://nyc3.digitaloceanspaces.com

echo "placing marker"
for row in $(echo "$PRESETS" | jq -r '.[] | @base64'); do
  PRESET=$(echo ${row} | base64 --decode | jq -r '.')
  PRESET_NAME=$(echo $PRESET | jq -r '.preset')
  S3_KEY="${VIDEO_ID}/versions/${PRESET_NAME}/marker.json"

  echo "marker preset: $PRESET"
  echo "marker preset_name: $PRESET_NAME"

  aws s3api put-object \
    --key $S3_KEY \
    --bucket ${BUCKET} \
    --profile digitalocean \
    --endpoint=https://nyc3.digitaloceanspaces.com
done

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
      -meta s3_out="s3://${BUCKET}/${VIDEO_ID}/versions/${PRESET_NAME}/segments/${SEGMENT}" \
      transcoding
  done
done

echo "removing tmp dir"
rm -rf $TMP_DIR

echo "done!"
