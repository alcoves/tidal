function handler () {
  set -e

  echo "Cleaning up lambda"
  rm -rf /tmp/tmp*

  SQS_BODY=$(echo $1 | jq -r '.Records[0].body')
  echo "SQS_BODY: $SQS_BODY"

  IN_PATH="$(echo $SQS_BODY | jq -r '.in_path')"
  OUT_PATH="$(echo $SQS_BODY | jq -r '.out_path')"
  FFMPEG_COMMAND=$(echo $SQS_BODY | jq -r '.ffmpeg_cmd')

  LVIP_DIR=$(mktemp -d)
  LVOP_DIR=$(mktemp -d)

  LVIP="$LVIP_DIR/${IN_PATH##*/}"
  LVOP="$LVOP_DIR/${OUT_PATH##*/}"

  echo $IN_PATH
  echo $OUT_PATH
  echo $FFMPEG_COMMAND

  echo "transcoding started"
  aws s3 cp $IN_PATH $LVIP
  /opt/ffmpeg/ffmpeg -y -i $LVIP $FFMPEG_COMMAND $LVOP
  aws s3 cp $LVOP $OUT_PATH

  echo "Cleaning up lambda"
  rm -rf /tmp/*
  
  echo "transcoding completed"
}
