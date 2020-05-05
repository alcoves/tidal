function handler () {
  set -e

  SQS_BODY=$(echo $1 | jq -r '.Records[0].body')
  echo "SQS_BODY: $SQS_BODY"

  IN_PATH="$(echo $SQS_BODY | jq -r '.in_path')"
  OUT_PATH="$(echo $SQS_BODY | jq -r '.out_path')"
  FFMPEG_COMMAND=$(echo $SQS_BODY | jq -r '.ffmpeg_cmd')

  echo $IN_PATH
  echo $OUT_PATH
  echo $FFMPEG_COMMAND

  echo "transcoding started"
  SIGNED_IN_URL=$(aws s3 presign $IN_PATH)
  /opt/ffmpeg/ffmpeg -i "$SIGNED_IN_URL" $FFMPEG_COMMAND | aws s3 cp - $OUT_PATH
  
  echo "transcoding completed"
}
