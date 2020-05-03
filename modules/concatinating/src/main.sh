function handler () {
  set -e
  rm -f /tmp/manifest.txt

  EVENT=$(echo $1 | jq -r '.')
  echo "EVENT: $EVENT"

  IN_PATH="$(echo $EVENT | jq -r '.in_path')"
  OUT_PATH="$(echo $EVENT | jq -r '.out_path')"
  CONCAT_WITH="$(echo $EVENT | jq -r '.concat_with')"

  # If level = 1 then we are making the final video from two segments
  # early return

  # If level is not 1 then we are concating two segments and recursively invoking the segmenter
  echo "Wait for concat_with segment to be created"

  echo "list segments"
  SEGMENTS=$(aws s3 ls $IN_PATH --recursive | awk '{print $4}')

  echo "creating manifest"
  touch /tmp/manifest.txt

  echo "file '$(aws s3 presign ${IN_PATH})'" >> /tmp/manifest.txt;
  echo "file '$(aws s3 presign ${CONCAT_WITH})'" >> /tmp/manifest.txt;

  echo "concatinating started"
  /opt/ffmpeg/ffmpeg -f concat -safe 0 \
    -protocol_whitelist "file,http,https,tcp,tls" \
    -i /tmp/manifest.txt \
    -c:v copy \
    -f matroska - | \
    aws s3 cp - $OUT_PATH

  rm -f /tmp/manifest.txt
  echo "concatinating completed"
}
