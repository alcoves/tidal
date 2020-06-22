function handler () {
  set -e

  BODY=$(echo $1 | jq -r '.')
  PRESETS="$(echo $BODY | jq -r '.presets')"
  IN_PATH="$(echo $BODY | jq -r '.in_path')"
  OUT_PATH="$(echo $BODY | jq -r '.out_path')"
  FFMPEG_CMD="$(echo $BODY | jq -r '.ffmpeg_cmd')"

  VIDEO_ID="$(echo $IN_PATH | cut -d'/' -f5)"
  echo "VIDEO_ID: ${VIDEO_ID}"
    
  rm -rf /mnt/tidal/audio/$VIDEO_ID
  mkdir -p /mnt/tidal/audio/$VIDEO_ID

  FILENAME=$(basename -- "$OUT_PATH")
  EXT="${FILENAME##*.}"
  echo "FILENAME: ${FILENAME}"
  echo "EXT: ${EXT}"

  echo "in: $IN_PATH | out: $OUT_PATH"
  /opt/ffmpeg/ffmpeg -y -hide_banner -loglevel panic -i $IN_PATH $FFMPEG_CMD $OUT_PATH
  echo "audio extraction completed"

  for row in $(echo "${PRESETS}" | jq -r '.[] | @base64'); do
    _jq() {
      echo ${row} | base64 --decode | jq -r ${1}
    }

    PRESET=$(_jq '.preset')
    echo "Updating $VIDEO_ID $PRESET with audio path"
    aws dynamodb update-item \
      --table-name tidal-dev \
      --key '{"id": {"S": '\"$VIDEO_ID\"'}, "preset": {"S": '\"$PRESET\"'}}' \
      --update-expression 'SET #audio.#audioExt = :path' \
      --expression-attribute-names '{"#audioExt":'\"$EXT\"',"#audio":"audio"}' \
      --expression-attribute-values '{":path":{"S":'\"${OUT_PATH}\"'}}'
  done
}
