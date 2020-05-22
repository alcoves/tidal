function handler () {
  set -e

  BODY=$(echo $1 | jq -r '.')
  IN_PATH="$(echo $BODY | jq -r '.in_path')"
  OUT_PATH="$(echo $BODY | jq -r '.out_path')"
  FFMPEG_CMD="$(echo $BODY | jq -r '.ffmpeg_cmd')"
  
  SIGNED_AUDIO_URL=$(aws s3 presign $IN_PATH)

  echo "in: $IN_PATH | out: $OUT_PATH"
  /opt/ffmpeg/ffmpeg -i "$SIGNED_AUDIO_URL" $FFMPEG_CMD - | aws s3 cp - $OUT_PATH
  echo "audio extraction completed"
}
