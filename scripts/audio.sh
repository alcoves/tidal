#!/bin/bash
set -e

IN_PATH=$1
OUT_PATH=$2
FFMPEG_CMD=$3

echo "IN_PATH: $IN_PATH"
echo "OUT_PATH: $OUT_PATH"
echo "FFMPEG_CMD: $FFMPEG_CMD"

echo "parsing variables"
VIDEO_ID="$(echo $OUT_PATH | cut -d'/' -f5)"  
PRESET_NAME="$(echo $OUT_PATH | cut -d'/' -f6)"
AUDIO_FILE_NAME="$(echo $OUT_PATH | cut -d'/' -f7)"

echo "VIDEO_ID: ${VIDEO_ID}"
echo "PRESET_NAME: ${PRESET_NAME}"
echo "AUDIO_FILE_NAME: ${AUDIO_FILE_NAME}"

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

echo "updating tidal db"
aws dynamodb update-item \
  --table-name "tidal" \
  --key '{"id": {"S": '\"$VIDEO_ID\"'}}' \
  --update-expression 'set versions.#preset.videoSegmentsCompleted = versions.#preset.videoSegmentsCompleted + :val' \
  --expression-attribute-names '{"#preset":'\"$PRESET_NAME\"'}' \
  --expression-attribute-values '{":val":{"N":"1"}}'
  
# Get the video record
# if the current preset video segment count is equal to expected count
# and if the current audio segment count is equal to expected count (which is 1 right now)
# then dispatch concatination request

# Need to do this for audio transcoding too


echo "audio extraction completed"