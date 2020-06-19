function handler () {
  set -e
  rm -f /tmp/out.mkv

  SQS_BODY=$(echo $1 | jq -r '.Records[0].body')
  echo "SQS_BODY: $SQS_BODY"

  IN_PATH="$(echo $SQS_BODY | jq -r '.in_path')"
  OUT_PATH="$(echo $SQS_BODY | jq -r '.out_path')"
  FFMPEG_COMMAND=$(echo $SQS_BODY | jq -r '.ffmpeg_cmd')

  echo "IN_PATH: ${IN_PATH}"
  echo "OUT_PATH: ${OUT_PATH}"
  echo "FFMPEG_COMMAND: ${FFMPEG_COMMAND}"

  VIDEO_ID="$(echo $OUT_PATH | cut -d'/' -f6)"  
  PRESET_NAME="$(echo $OUT_PATH | cut -d'/' -f7)"
  SEGMENT_NAME="$(echo $OUT_PATH | cut -d'/' -f8)"

  echo "make sure directory exists"
  [[ -d /mnt/tidal/segments/transcoded/${VIDEO_ID}/${PRESET_NAME} ]] \
    || mkdir -p /mnt/tidal/segments/transcoded/${VIDEO_ID}/${PRESET_NAME}

  echo "VIDEO_ID: ${VIDEO_ID}"
  echo "PRESET_NAME: ${PRESET_NAME}"
  echo "SEGMENT_NAME: ${SEGMENT_NAME}"

  echo "transcoding started"
  SIGNED_IN_URL=$(aws s3 presign $IN_PATH)
  /opt/ffmpeg/ffmpeg -i "$SIGNED_IN_URL" $FFMPEG_COMMAND $OUT_PATH

  echo "updating tidal database with status"
  aws dynamodb update-item \
    --table-name tidal-dev \
    --key '{"id": {"S": '\"$VIDEO_ID\"'}, "preset": {"S": '\"$PRESET_NAME\"'}}' \
    --update-expression 'SET #segments.#segName = :status' \
    --expression-attribute-names '{"#segName":'\"$SEGMENT_NAME\"',"#segments":"segments"}' \
    --expression-attribute-values '{":status":{"BOOL":true}}'
  
  echo "transcoding completed"
}
