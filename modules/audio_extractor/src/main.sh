function handler () {
  set -e
  
  SQS_BODY=$(echo $1 | jq -r '.')
  IN_PATH="$(echo $SQS_BODY | jq -r '.in_path')"
  OUT_PATH="$(echo $SQS_BODY | jq -r '.out_path')"
  PRESIGNED_URL=$(aws s3 presign $IN_PATH)

  echo "in: $IN_PATH | out: $OUT_PATH"
  /opt/ffmpeg/ffmpeg -i "$PRESIGNED_URL" -vn -f wav - | aws s3 cp - $OUT_PATH
  echo "audio extraction completed"
}
