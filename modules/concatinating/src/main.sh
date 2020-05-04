function handler () {
  set -e
  rm -f /tmp/manifest.txt

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
  
  if `expr $SEGMENT_NUM % 2`; then
    echo "$SEGMENT_NUM is odd"
    PARTNER_SEGMENT_NUM=`expr $SEGMENT_NUM - 1`
    PARTNER_SEGMENT_NAME=`printf %0${PADDING_LEN}d $PARTNER_SEGMENT_NUM`
    PARTNER_SEGMENT_NAME="${PARTNER_SEGMENT_NAME}.mkv"
    
    EVEN_SEGMENT_NUM=$PARTNER_SEGMENT_NUM
    EVEN_SEGMENT_NAME=$PARTNER_SEGMENT_NAME
    EVEN_SEGMENT_PATH="s3://${BUCKET}/segments/transcoded/${VIDEO_ID}/${PRESET_NAME}/${LEVEL}/${EVEN_SEGMENT_NAME}"

    ODD_SEGMENT_NUM=$SEGMENT_NUM
    ODD_SEGMENT_NAME=$SEGMENT_NAME
    ODD_SEGMENT_PATH="s3://${BUCKET}/segments/transcoded/${VIDEO_ID}/${PRESET_NAME}/${LEVEL}/${ODD_SEGMENT_NAME}"
  else
    echo "$SEGMENT_NUM is even"
    PARTNER_SEGMENT_NUM=`expr $SEGMENT_NUM + 1`
    PARTNER_SEGMENT_NAME=`printf %0${PADDING_LEN}d $PARTNER_SEGMENT_NUM`
    PARTNER_SEGMENT_NAME="${PARTNER_SEGMENT_NAME}.mkv"
    
    EVEN_SEGMENT_NUM=$SEGMENT_NUM
    EVEN_SEGMENT_NAME=$SEGMENT_NAME
    EVEN_SEGMENT_PATH="s3://${BUCKET}/segments/transcoded/${VIDEO_ID}/${PRESET_NAME}/${LEVEL}/${EVEN_SEGMENT_NAME}"

    ODD_SEGMENT_NUM=$PARTNER_SEGMENT_NUM
    ODD_SEGMENT_NAME=$PARTNER_SEGMENT_NAME
    ODD_SEGMENT_PATH="s3://${BUCKET}/segments/transcoded/${VIDEO_ID}/${PRESET_NAME}/${LEVEL}/${ODD_SEGMENT_NAME}"
  fi
  
  NEXT_SEGMENT_NUM=`expr $EVEN_SEGMENT_NUM / 2`
  NEXT_SEGMENT_NAME=`printf %0${PADDING_LEN}d $NEXT_SEGMENT_NUM`
  NEXT_SEGMENT_NAME="${NEXT_SEGMENT_NAME}.mkv"

  PARTNER_KEY="${KEY/$SEGMENT_NAME/$PARTNER_SEGMENT_NAME}"
  
  echo "PADDING_LEN: $PADDING_LEN"
  echo "PARTNER_KEY: $PARTNER_KEY"
  echo "ODD_SEGMENT_NAME: $ODD_SEGMENT_NAME"
  echo "ODD_SEGMENT_NUM: $ODD_SEGMENT_NUM"
  echo "EVEN_SEGMENT_NAME: $EVEN_SEGMENT_NAME"
  echo "EVEN_SEGMENT_NUM: $EVEN_SEGMENT_NUM"
  echo "PARTNER_SEGMENT_NAME: $PARTNER_SEGMENT_NAME"
  echo "NEXT_SEGMENT_NUM: $NEXT_SEGMENT_NUM"
  echo "NEXT_SEGMENT_NAME: $NEXT_SEGMENT_NAME"
  
  PARTNER_EXISTS=$(aws s3api head-object --bucket $BUCKET --key $PARTNER_KEY || true)
  echo "PARTNER_EXISTS: $PARTNER_EXISTS"
  if [ -z $PARTNER_EXISTS ]; then
    echo "Partner segment does not exist"
    # When the partner does not exist, it's possible we've reached the last segment
    # We handle the last odd segment by passing it to the next level
    # First we have to check that the segment is the last segment
    SEGMENT_EXISTS=$(aws s3api head-object --bucket $BUCKET --key $KEY || true)
    echo "SEGMENT_EXISTS: $SEGMENT_EXISTS"

    if [ -z $SEGMENT_EXISTS ]; then
      echo "Event segment was not found"
    else
      echo "Event segment exists"
      LAST_ODD_SEGMENT=$(echo $SEGMENT_EXISTS | jq -r ".Metadata.last_odd_segment")
      if [ "$LAST_ODD_SEGMENT" = "true" ]; then
        echo "Last segment found, passing it down!"
        LAST_SEGMENT_OUT_PATH="s3://${BUCKET}/segments/transcoded/${VIDEO_ID}/${PRESET_NAME}/${NEXT_LEVEL}/${NEXT_SEGMENT_NAME}"
        aws s3 cp "s3://${BUCKET}/$KEY" "$LAST_SEGMENT_OUT_PATH"
      else
        echo "Last segment not found, skipping"
      fi
    fi

  else
    echo "Beginning concatination"
    touch /tmp/manifest.txt
    
    OUT_PATH="s3://${BUCKET}/segments/transcoded/${VIDEO_ID}/${PRESET_NAME}/${NEXT_LEVEL}/${NEXT_SEGMENT_NAME}"
    echo "OUT_PATH: $OUT_PATH"
    
    echo "file '$(aws s3 presign $EVEN_SEGMENT_PATH)'" >> /tmp/manifest.txt;
    echo "file '$(aws s3 presign $ODD_SEGMENT_PATH)'" >> /tmp/manifest.txt;
    
    /opt/ffmpeg/ffmpeg -f concat -safe 0 \
      -protocol_whitelist "file,http,https,tcp,tls" \
      -i /tmp/manifest.txt \
      -c copy \
      -f matroska - | \
      aws s3 cp - $OUT_PATH
      
    rm -f /tmp/manifest.txt
  fi
}