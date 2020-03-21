function handler () {
  set -e

  SQS_BODY=$(echo $1 | jq -r '.Records[0].body')
  echo "SQS_BODY: $SQS_BODY"

  IN_PATH="s3://$(echo $SQS_BODY | jq -r '.inPath')"
  OUT_PATH="s3://$(echo $SQS_BODY | jq -r '.outPath')"
  FFMPEG_COMMAND=$(echo $SQS_BODY | jq -r '.ffmpegCommand')

  LVIP="/tmp/${IN_PATH##*/}"
  LVOP="/tmp/${OUT_PATH##*/}"

  echo $IN_PATH
  echo $OUT_PATH
  echo $FFMPEG_COMMAND

  echo "transcoding started"
  aws s3 cp $IN_PATH $LVIP
  /opt/ffmpeg/ffmpeg -y -i $LVIP $FFMPEG_COMMAND $LVOP
  aws s3 cp $LVOP $OUT_PATH

  rm -f $LVIP
  rm -f $LVOP
  echo "transcoding completed"
}
