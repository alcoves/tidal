function handler () {
  set -e

  SQS_BODY=$(echo $1 | jq -r '.Records[0].body')
  echo "SQS_BODY: $SQS_BODY"

  IN_PATH="s3://$(echo $SQS_BODY | jq -r '.inPath')"
  OUT_PATH="s3://$(echo $SQS_BODY | jq -r '.outPath')"
  FFMPEG_COMMAND=$(echo $SQS_BODY | jq -r '.ffmpegCommand')

  echo "transcoding started"
  aws s3 cp $IN_PATH - | /opt/ffmpeg/ffmpeg -i - $FFMPEG_COMMAND - | aws s3 cp - $OUT_PATH
  echo "transcoding completed"
}
