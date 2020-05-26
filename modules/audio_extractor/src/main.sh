function handler () {
  set -e

  echo "Cleaning up dirs"
  rm -rf /tmp/*.aac
  rm -rf /tmp/*.ogg

  BODY=$(echo $1 | jq -r '.')
  IN_PATH="$(echo $BODY | jq -r '.in_path')"
  OUT_PATH="$(echo $BODY | jq -r '.out_path')"
  FFMPEG_CMD="$(echo $BODY | jq -r '.ffmpeg_cmd')"

  FILENAME=$(basename -- "$OUT_PATH")
  EXT="${FILENAME##*.}"
  
  LOCAL_OUT_PATH="/tmp/out.${EXT}"
  SIGNED_VIDEO_URL=$(aws s3 presign $IN_PATH)

  echo "in: $IN_PATH | out: $OUT_PATH"
  /opt/ffmpeg/ffmpeg -i "$SIGNED_VIDEO_URL" $FFMPEG_CMD $LOCAL_OUT_PATH
  aws s3 cp $LOCAL_OUT_PATH $OUT_PATH
  rm -f $LOCAL_OUT_PATH
  echo "audio extraction completed"

  echo "Cleaning up dirs"
  rm -rf /tmp/*.aac
  rm -rf /tmp/*.ogg
}
