function handler () {
  set -e
  rm -f /tmp/out.mkv

  SQS_BODY=$(echo $1 | jq -r '.Records[0].body')
  echo "SQS_BODY: $SQS_BODY"

  IN_PATH="$(echo $SQS_BODY | jq -r '.in_path')"
  OUT_PATH="$(echo $SQS_BODY | jq -r '.out_path')"
  FFMPEG_COMMAND=$(echo $SQS_BODY | jq -r '.ffmpeg_cmd')
  VIDEO_ID="$(echo $OUT_PATH | cut -d'/' -f6)"  
  PRESET_NAME="$(echo $OUT_PATH | cut -d'/' -f7)"
  SEGMENT_NAME="$(echo $OUT_PATH | cut -d'/' -f8)"

  echo "IN_PATH: ${IN_PATH}"
  echo "OUT_PATH: ${OUT_PATH}"
  echo "FFMPEG_COMMAND: ${FFMPEG_COMMAND}"
  echo "VIDEO_ID: ${VIDEO_ID}"
  echo "PRESET_NAME: ${PRESET_NAME}"
  echo "SEGMENT_NAME: ${SEGMENT_NAME}"

  echo "transcoding started"
  SIGNED_IN_URL=$(aws s3 presign $IN_PATH)
  /opt/ffmpeg/ffmpeg -i "$SIGNED_IN_URL" $FFMPEG_COMMAND /tmp/out.mkv
  aws s3 cp /tmp/out.mkv $OUT_PATH

  echo "updating tidal database with status"
  aws dynamodb update-item \
    --table-name tidal-dev \
    --key '{"id": {"S": '\"$VIDEO_ID\"'}, "preset": {"S": '\"$PRESET\"'}}' \
    --update-expression 'SET transcoded.#segName = :status' \
    --expression-attribute-names '{"#segName":'\"$SEGMENT_NAME\"'}' \
    --expression-attribute-values '{":status":{"BOOL":true}}'
  
  rm -f /tmp/out.mkv
  echo "transcoding completed"
}
