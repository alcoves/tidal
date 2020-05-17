function handler () {
  echo "Cleaning up lambda env"
  rm -f /tmp/*.mkv
  rm -f /tmp/*.txt
  rm -f /tmp/*.webm

  SQS_BODY=$(echo $1 | jq -r '.Records[0].body')
  echo "SQS_BODY: $SQS_BODY"

  IN_PATH="$(echo $SQS_BODY | jq -r '.in_path')"
  OUT_PATH="$(echo $SQS_BODY | jq -r '.out_path')"

  BUCKET="$(echo $IN_PATH | cut -d'/' -f3)"
  echo "BUCKET: ${BUCKET}"
  
  VIDEO_ID="$(echo $IN_PATH | cut -d'/' -f6)"
  echo "VIDEO_ID: ${VIDEO_ID}"
  
  PRESET_NAME="$(echo $IN_PATH | cut -d'/' -f7)"
  echo "PRESET_NAME: ${PRESET_NAME}"

  echo "creating signed audio url"
  SIGNED_AUDIO_URL=$(aws s3 presign s3://${BUCKET}/audio/${VIDEO_ID}/source.ogg)

  echo "creating manifest"
  touch /tmp/manifest.txt

  echo "list segments"
  SEGMENTS=$(aws s3 ls $IN_PATH --recursive | awk '{print $4}')
  echo "SEGMENTS: $SEGMENTS"

  for SEGMENT in $SEGMENTS; do
    echo "file '$(aws s3 presign s3://${BUCKET}/${SEGMENT})'" >> /tmp/manifest.txt;
  done

  echo "concatinating started"
  /opt/ffmpeg/ffmpeg -f concat -safe 0 \
    -protocol_whitelist "file,http,https,tcp,tls" \
    -i /tmp/manifest.txt \
    -c copy \
    -f matroska - | \
    /opt/ffmpeg/ffmpeg \
    -i - -i "$SIGNED_AUDIO_URL" \
    -c copy \
    /tmp/out.webm
    
  echo "uploading file"
  aws s3 cp /tmp/out.webm $OUT_PATH

  rm -f /tmp/*.mkv
  rm -f /tmp/*.txt
  rm -f /tmp/*.webm
  echo "concatinating completed"
}