#!/bin/bash
set -e

echo "Setting env"
PRESET=$1
BUCKET=$2
VIDEO_ID=$3
AWS_ACCESS_KEY_ID=$4
AWS_SECRET_ACCESS_KEY=$5

TMP_DIR=$(mktemp -d)
AUDIO_PATH="$TMP_DIR/source.wav"
MANIFEST_PATH="$TMP_DIR/manifest.txt"
TRANSCODE_DIR="$TMP_DIR/transcoded-segments"
TRANSCODED_FILE_WITH_AUDIO="$TMP_DIR/${PRESET}.mp4"
TRANSCODED_FILE_WITHOUT_AUDIO="$TMP_DIR/${PRESET}-no-audio.mp4"

mkdir -p $TRANSCODE_DIR

echo "Creating rclone config"
mkdir -p /root/.config/rclone
cat > /root/.config/rclone/rclone.conf <<EOL
[do]
type = s3
provider = DigitalOcean
env_auth = false
access_key_id = $AWS_ACCESS_KEY_ID
secret_access_key = $AWS_SECRET_ACCESS_KEY
endpoint = nyc3.digitaloceanspaces.com
acl = private
EOL

echo "Quering S3"
NUM_EXPECTED=$(rclone ls do:$BUCKET/segments/$VIDEO_ID | wc -l)
NUM_TRANSCODED=$(rclone ls do:$BUCKET/transcoded-segments/$VIDEO_ID/$PRESET/ | wc -l)

echo "NUM_EXPECTED $NUM_EXPECTED"
echo "NUM_TRANSCODED $NUM_TRANSCODED"

while [ "$NUM_TRANSCODED" -ne "$NUM_EXPECTED" ]; do
  sleep 5
  echo "Waiting for transcoded parts"
  echo "NUM_EXPECTED $NUM_EXPECTED"
  echo "NUM_TRANSCODED $NUM_TRANSCODED"
  NUM_TRANSCODED=$(rclone ls do:$BUCKET/transcoded-segments/$VIDEO_ID/$PRESET/ | wc -l)
done

echo "Downloading transcoded segments"
rclone sync do:$BUCKET/transcoded-segments/$VIDEO_ID/$PRESET $TRANSCODE_DIR

echo "Downloading source audio"
rclone copy do:$BUCKET/audio/$VIDEO_ID/source.wav $TMP_DIR

echo "Creating concatination manifest"
for PART in $(ls $TRANSCODE_DIR/); do
  echo "file './transcoded-segments/$PART'" >> $MANIFEST_PATH
done

echo "Concatinating video segments"
ffmpeg -y -f concat -threads 1 -safe 0 -i $MANIFEST_PATH -c copy $TRANSCODED_FILE_WITHOUT_AUDIO

echo "Combining source audio with concatinated video"
ffmpeg -y -i $TRANSCODED_FILE_WITHOUT_AUDIO -i $AUDIO_PATH -threads 1 -c:v copy -c:a aac $TRANSCODED_FILE_WITH_AUDIO

echo "Uploading video"
rclone copy $TRANSCODED_FILE_WITH_AUDIO do:$BUCKET/transcoded/$VIDEO_ID

echo "Concatinating success!"
