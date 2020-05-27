function handler () {
  set -e

  echo "Cleaning up dirs"
  rm -rf /tmp/*.aac
  rm -rf /tmp/*.ogg

  BODY=$(echo $1 | jq -r '.')
  PRESETS="$(echo $BODY | jq -r '.presets')"
  IN_PATH="$(echo $BODY | jq -r '.in_path')"
  OUT_PATH="$(echo $BODY | jq -r '.out_path')"
  FFMPEG_CMD="$(echo $BODY | jq -r '.ffmpeg_cmd')"

  BUCKET="$(echo $IN_PATH | cut -d'/' -f3)"
  echo "BUCKET: ${BUCKET}"

  VIDEO_ID="$(echo $IN_PATH | cut -d'/' -f4)"
  echo "VIDEO_ID: ${VIDEO_ID}"

  FILENAME=$(basename -- "$OUT_PATH")
  EXT="${FILENAME##*.}"
  
  LOCAL_OUT_PATH="/tmp/out.${EXT}"
  SIGNED_VIDEO_URL=$(aws s3 presign $IN_PATH)

  echo "in: $IN_PATH | out: $OUT_PATH"
  /opt/ffmpeg/ffmpeg -i "$SIGNED_VIDEO_URL" $FFMPEG_CMD $LOCAL_OUT_PATH
  aws s3 cp $LOCAL_OUT_PATH $OUT_PATH
  rm -f $LOCAL_OUT_PATH
  echo "audio extraction completed"

  for row in $(echo "${PRESETS}" | jq -r '.[] | @base64'); do
    _jq() {
      echo ${row} | base64 --decode | jq -r ${1}
    }

    PRESET=$(_jq '.preset')
    echo "Updating $PRESET with audio path"
    aws dynamodb update-item \
      --table-name tidal-dev \
      --key '{"id": {"S": '\"$VIDEO_ID\"'}, "preset": {"S": '\"$PRESET\"'}}' \
      --update-expression 'SET #audio.#audioExt = :path' \
      --expression-attribute-names '{"#audioExt":'\"$EXT\"',"#audio":"audio"}' \
      --expression-attribute-values '{":path":{"S":'\"${OUT_PATH}\"'}}'
  done

  echo "Cleaning up dirs"
  rm -rf /tmp/*.aac
  rm -rf /tmp/*.ogg
}
