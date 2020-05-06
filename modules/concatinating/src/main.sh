function handler () {
  echo "Cleaning up lambda env"
  rm -f /tmp/*.txt
  rm -f /tmp/*.json

  SQS_BODY=$(echo $1 | jq -r '.Records[0].body')
  # echo "SQS_BODY: $SQS_BODY"
  
  BUCKET=$(echo $SQS_BODY | jq -r '.Records[0].s3.bucket.name')
  echo "BUCKET: ${BUCKET}"

  KEY=$(echo $SQS_BODY | jq -r '.Records[0].s3.object.key')
  echo "KEY: ${KEY}"
  
  VIDEO_ID="$(echo $KEY | cut -d'/' -f3)"
  echo "VIDEO_ID: ${VIDEO_ID}"
  
  PRESET_NAME="$(echo $KEY | cut -d'/' -f4)"
  echo "PRESET_NAME: ${PRESET_NAME}"

  LEVEL="$(echo $KEY | cut -d'/' -f5)"
  NEXT_LEVEL=`expr $LEVEL + 1`
  echo "LEVEL: ${LEVEL}"
  echo "NEXT_LEVEL: ${NEXT_LEVEL}"
  
  SEGMENT_NAME="$(echo $KEY | cut -d'/' -f6)"
  echo "SEGMENT_NAME: ${SEGMENT_NAME}"

  SEGMENT_NUM="$(echo $SEGMENT_NAME | cut -d'.' -f1)"
  echo "SEGMENT_NUM: ${SEGMENT_NUM}"
  
  PADDING_LEN=${#SEGMENT_NUM}
  echo "PADDING_LEN: ${PADDING_LEN}"

  echo "Getting manifest from s3"
  MANIFEST_LOCAL_PATH="/tmp/${VIDEO_ID}-${PRESET_NAME}.json"
  MANIFEST_REMOTE_PATH="s3://${BUCKET}/segments/transcoded/${VIDEO_ID}/${PRESET_NAME}.json"
  aws s3 cp $MANIFEST_REMOTE_PATH $MANIFEST_LOCAL_PATH

  TO=$(cat $MANIFEST_LOCAL_PATH | jq -r --arg level $LEVEL --arg key $KEY '.[$level][$key].to')
  MODE=$(cat $MANIFEST_LOCAL_PATH | jq -r --arg level $LEVEL --arg key $KEY '.[$level][$key].mode')
  IS_PARENT=$(cat $MANIFEST_LOCAL_PATH | jq -r --arg level $LEVEL --arg key $KEY '.[$level][$key].isParent')
  COMBINE_WITH=$(cat $MANIFEST_LOCAL_PATH | jq -r --arg level $LEVEL --arg key $KEY '.[$level][$key].combineWith')
  
  echo $TO
  echo $MODE
  echo $IS_PARENT
  echo $COMBINE_WITH

  # "mode": "concat",
  # "isParent": "true",
  # "to": "s3://tidal-bken-dev/segments/transcoded/test/libvpx_vp9-720p/2/000000.mkv",
  # "combineWith": "s3://tidal-bken-dev/segments/transcoded/test/libvpx_vp9-720p/1/000001.mkv"

  if [ "$MODE" = "mux" ]; then
    echo "=== MUX MODE ==="
    FINAL_SEGMENT_URL=$(aws s3 presign s3://${BUCKET}/${KEY})
    SIGNED_AUDIO_URL=$(aws s3 presign $COMBINE_WITH)
    FIRST_MUX_PASS="s3://${BUCKET}/muxing/${KEY}"

    echo "First mux pass"
    /opt/ffmpeg/ffmpeg \
      -i "$FINAL_SEGMENT_URL" \
      -i "$SIGNED_AUDIO_URL" \
      -c copy \
      -f webm - | \
      aws s3 cp - $FIRST_MUX_PASS

    FIRST_MUX_PASS_URL=$(aws s3 presign $FIRST_MUX_PASS)
    echo "Second mux pass"
    /opt/ffmpeg/ffmpeg \
      -i "$FIRST_MUX_PASS_URL" \
      -c copy \
      -f webm - | \
      aws s3 cp - $TO
  fi

  if [ "$MODE" = "passthru" ]; then
    echo "=== PASSTHRU MODE ==="
    aws s3 cp s3://$BUCKET/$KEY $TO
  fi

  if [ "$MODE" = "concat" ]; then
    COMBINE_WITH_KEY="$(echo $COMBINE_WITH | cut -d'/' -f4-)"
    PARTNER_EXISTS=$(aws s3api head-object --bucket $BUCKET --key $COMBINE_WITH_KEY || true)
    echo "PARTNER_EXISTS: $PARTNER_EXISTS"
    if [ -z $PARTNER_EXISTS ]; then
      echo "Partner segment does not exist"
    else
      echo "=== CONCAT MODE ==="
      touch /tmp/manifest.txt
      
      if [ "$IS_PARENT" = "true" ]; then
        echo "file '$(aws s3 presign s3://$BUCKET/$KEY)'" >> /tmp/manifest.txt;
        echo "file '$(aws s3 presign $COMBINE_WITH)'" >> /tmp/manifest.txt;
      else
        echo "file '$(aws s3 presign $COMBINE_WITH)'" >> /tmp/manifest.txt;
        echo "file '$(aws s3 presign s3://$BUCKET/$KEY)'" >> /tmp/manifest.txt;
      fi

      /opt/ffmpeg/ffmpeg -f concat -safe 0 \
        -protocol_whitelist "file,http,https,tcp,tls" \
        -i /tmp/manifest.txt \
        -c copy \
        -f matroska - | \
        aws s3 cp - $TO
    fi
  fi

  rm -f /tmp/*.txt
  rm -f /tmp/*.json
}