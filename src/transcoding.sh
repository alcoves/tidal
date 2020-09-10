#!/bin/bash
set -e

S3_IN=$1
S3_OUT=$2
FFMPEG_COMMAND=$3

echo "S3_IN: ${S3_IN}"
echo "S3_OUT: ${S3_OUT}"
echo "FFMPEG_COMMAND: ${FFMPEG_COMMAND}"

echo "creating signed source url"
SIGNED_SOURCE_URL=$(aws s3 presign $S3_IN --profile digitalocean --endpoint=https://nyc3.digitaloceanspaces.com)

echo "parsing variables"
BUCKET="$(echo $S3_OUT | cut -d'/' -f3)"  
VIDEO_ID="$(echo $S3_OUT | cut -d'/' -f5)"  
PRESET_NAME="$(echo $S3_OUT | cut -d'/' -f6)"
SEGMENT_NAME="$(echo $S3_OUT | cut -d'/' -f7)"

echo "BUCKET: ${BUCKET}"
echo "VIDEO_ID: ${VIDEO_ID}"
echo "PRESET_NAME: ${PRESET_NAME}"
echo "SEGMENT_NAME: ${SEGMENT_NAME}"

echo "creating tmp file"
TMP_VIDEO_PATH=$(mktemp --suffix=.${SEGMENT_NAME})

echo "transcoding started"
ffmpeg -y -i "$SIGNED_SOURCE_URL" $FFMPEG_COMMAND $TMP_VIDEO_PATH

echo "moving transcode to s3"
aws s3 mv $TMP_VIDEO_PATH $S3_OUT --profile digitalocean --endpoint=https://nyc3.digitaloceanspaces.com

echo "counting source segments"
SOURCE_SEGMENTS_COUNT=$(aws s3 ls s3://${BUCKET}/segments/${VIDEO_ID}/source/ --profile digitalocean --endpoint=https://nyc3.digitaloceanspaces.com | wc -l)

echo "counting transcoded segments"
TRANSCODED_SEGMENTS_COUNT=$(aws s3 ls s3://${BUCKET}/segments/${VIDEO_ID}/${PRESET_NAME}/ --profile digitalocean --endpoint=https://nyc3.digitaloceanspaces.com | wc -l)

if ["$SOURCE_SEGMENTS_COUNT" -eq "$TRANSCODED_SEGMENTS_COUNT"]; then
  function concat {
    EXISTS=$(consul kv get tidal/${VIDEO_ID}/${PRESET_NAME})
    if [ -z "$EXISTS" ]; then
      echo "dispatching concatination job"
      # nomad job dispatch \
      #   -detach \
      #   -meta cmd="$CMD" \
      #   -meta s3_in="s3://${BUCKET}/segments/${VIDEO_ID}/source/${SEGMENT}" \
      #   -meta s3_out="s3://${BUCKET}/segments/${VIDEO_ID}/${PRESET_NAME}/${SEGMENT}" \
      #   concatinating
      consul kv delete "tidal/${VIDEO_ID}/${PRESET_NAME}"
    else
      echo "aquired concatiantion lock, but had already been handled"
    fi
  }

  consul lock "tidal/${VIDEO_ID}" concat
else
  echo "segment count failed to match expected ${SOURCE_SEGMENTS_COUNT} got ${TRANSCODED_SEGMENTS_COUNT}"
fi

echo "done!"