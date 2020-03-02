function handler () {
  set -e
  EVENT_DATA=$1
  TRANSCODED_SEGMENTS=$(aws s3 ls s3://tidal-bken-dev/transcoded-segments/test/720p --recursive | awk '{print $4}')
  AUDIO=$(aws s3 presign s3://tidal-bken-dev/audio/test/audio.wav)

  rm -f /tmp/concat-manifest.txt
  for PART in $TRANSCODED_SEGMENTS; do
    echo "file $(aws s3 presign s3://tidal-bken-dev/$PART)" >> /tmp/concat-manifest.txt;
  done

  ffmpeg -y -f concat -safe 0 -protocol_whitelist file,http,https,tcp,tls \
    -i /tmp/concat-manifest.txt -i $AUDIO -c:v copy -c:a aac \
    -f mp4 -movflags frag_keyframe+faststart pipe:1 | \
    aws s3 cp - s3://tidal-bken-dev/transcoded/test/720p.mp4
  exit 0
}