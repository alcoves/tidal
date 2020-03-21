function handler () {
  set -e

  SQS_BODY=$(echo $1 | jq -r '.Records[0].body')
  echo "SQS_BODY: $SQS_BODY"

  IN_PATH="s3://$(echo $SQS_BODY | jq -r '.inPath')"
  OUT_PATH="s3://$(echo $SQS_BODY | jq -r '.outPath')"
  FFMPEG_COMMAND=$(echo $SQS_BODY | jq -r '.ffmpegCommand')

  echo $IN_PATH
  echo $OUT_PATH
  echo $FFMPEG_COMMAND

  echo "transcoding started"
  aws s3 cp $IN_PATH /tmp/in
  aws s3 cp /tmp/in - | /opt/ffmpeg/ffmpeg -i /tmp/in $FFMPEG_COMMAND /tmp/out.mkv
  aws s3 cp /tmp/out.mkv $OUT_PATH
  echo "transcoding completed"
}
