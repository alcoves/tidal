function handler () {
  set -e
  rm -f /tmp/manifest.txt

  EVENT=$(echo $1 | jq -r '.')
  echo "EVENT: $EVENT"

  BUCKET="$(echo $EVENT | jq -r '.bucket')"
  IN_PATH="$(echo $EVENT | jq -r '.in_path')"
  OUT_PATH="$(echo $EVENT | jq -r '.out_path')"
  AUDIO_PATH="$(echo $EVENT | jq -r '.audio_path')"

  AUDIO_URL=$(aws s3 presign $AUDIO_PATH)

  echo "list segments"
  SEGMENTS=$(aws s3 ls $IN_PATH --recursive | awk '{print $4}')

  echo "creating manifest"
  touch /tmp/manifest.txt

  for SEGMENT in $SEGMENTS; do
    SIGNED_URL=$(aws s3 presign s3://${BUCKET}/${SEGMENT})
    echo "file '$SIGNED_URL'" >> /tmp/manifest.txt;
  done

  echo "concatinating started"
  /opt/ffmpeg/ffmpeg -f concat -safe 0 \
    -protocol_whitelist "file,http,https,tcp,tls" \
    -i /tmp/manifest.txt \
    -avoid_negative_ts 1 \
    -c:v copy -f matroska - | \
    /opt/ffmpeg/ffmpeg -i - -i "$AUDIO_URL" \
    -c:v copy -f webm \
    -avoid_negative_ts 1 \
    aws s3 cp - $OUT_PATH

  rm -f /tmp/manifest.txt
  echo "concatinating completed"
}
