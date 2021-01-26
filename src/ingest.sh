#!/bin/bash
set -e
echo "starting video conversion process"

echo "setting variables"
S3_IN=$1
TIDAL_PATH=${2:-"/root/tidal"}

BUCKET="$(echo $S3_IN | cut -d'/' -f3)"
echo "BUCKET: ${BUCKET}"

VIDEO_ID="$(echo $S3_IN | cut -d'/' -f4)"
echo "VIDEO_ID: ${VIDEO_ID}"

echo "creating tmp dir"
TMP_DIR=$(mktemp -d)
echo "TMP_DIR: $TMP_DIR"

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
  --exclude "source.*" \
  --endpoint=https://us-east-2.wasabisys.com

echo "getting presets"
SIGNED_VIDEO_URL=$(aws s3 presign $S3_IN --profile wasabi --endpoint=https://us-east-2.wasabisys.com)
PRESETS=$($TIDAL_PATH/main presets "$SIGNED_VIDEO_URL" | jq -r '.presets')

echo "placing marker which display presets to the user"
for ROW in $(echo "$PRESETS" | jq -r '.[] | @base64'); do
  PRESET=$(echo ${ROW} | base64 --decode | jq -r '.')
  PRESET_NAME=$(echo $PRESET | jq -r '.name')
  S3_KEY="${VIDEO_ID}/versions/${PRESET_NAME}/marker.json"

  echo "marker preset: $PRESET"
  echo "marker preset_name: $PRESET_NAME"

  aws s3api put-object \
    --key $S3_KEY \
    --bucket ${BUCKET} \
    --profile digitalocean \
    --endpoint=https://nyc3.digitaloceanspaces.com
done

echo "downloading source video"
aws s3 cp $S3_IN $TMP_DIR \
  --quiet \
  --profile wasabi \
  --endpoint=https://us-east-2.wasabisys.com
SOURCE_VIDEO_PATH=$(ls $TMP_DIR/*)

echo "segmenting video"
SEGMENT_TMP_DIR=$TMP_DIR/segments
mkdir -p $SEGMENT_TMP_DIR
ffmpeg -i $SOURCE_VIDEO_PATH -an -c:v copy -f segment -segment_time 10 $SEGMENT_TMP_DIR/%09d.mp4

echo "uploading segments"
aws s3 cp \
  $SEGMENT_TMP_DIR \
  s3://${BUCKET}/${VIDEO_ID}/segments \
  --quiet \
  --recursive \
  --profile digitalocean \
  --endpoint=https://nyc3.digitaloceanspaces.com

echo "splitting source audio"
HAS_AUDIO=$(ffprobe -i $SOURCE_VIDEO_PATH -show_streams -select_streams a -of json -loglevel error)
AUDIO_STREAM_LENGTH=$(echo $HAS_AUDIO | jq -r '.streams | length')

if [ "$AUDIO_STREAM_LENGTH" -gt 0 ]; then
  echo "video contains audio"
  AUDIO_PATH="${TMP_DIR}/audio.aac"

  echo "exporting audio to $AUDIO_PATH"
  # TODO :: If the audio is aac, could use ffmpeg -c:a copy instead
  ffmpeg -i $SOURCE_VIDEO_PATH -vn $AUDIO_PATH

  echo "uploading"
  aws s3 cp \
    $AUDIO_PATH \
    s3://${BUCKET}/${VIDEO_ID}/audio.aac \
    --quiet \
    --profile digitalocean \
    --endpoint=https://nyc3.digitaloceanspaces.com

  rm $AUDIO_PATH
else
  echo "video does not contain audio"
fi

echo "dispatching transcoding jobs"
for ROW in $(echo "$PRESETS" | jq -r '.[] | @base64'); do
  PRESET=$(echo ${ROW} | base64 --decode | jq -r '.')
  CMD=$(echo $PRESET | jq -r '.cmd')
  PRESET_NAME=$(echo $PRESET | jq -r '.name')

  echo "putting consul kv value used for preset locking"
  consul kv put tidal/${VIDEO_ID}/${PRESET_NAME} $VIDEO_ID/$PRESET_NAME

  for SEGMENT in $(ls $SEGMENT_TMP_DIR); do
    nomad job dispatch \
      -detach \
      -meta cmd="$CMD" \
      -meta s3_in="s3://${BUCKET}/${VIDEO_ID}/segments/${SEGMENT}" \
      -meta s3_out="s3://${BUCKET}/${VIDEO_ID}/versions/${PRESET_NAME}/segments/${SEGMENT}.mkv" \
      transcode
  done
done

echo "removing tmp dir"
rm -rf $TMP_DIR

echo "done!"