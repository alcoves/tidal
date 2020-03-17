#!/bin/bash
set -e

echo "Setting env"
PRESET=$1
BUCKET=$2
VIDEO_ID=$3

AUDIO_PATH="local/source.wav"
MANIFEST_PATH="local/manifest.txt"
TRANSCODE_DIR="local/transcoded-segments"
TRANSCODED_FILE_WITH_AUDIO="local/${PRESET}.mp4"
TRANSCODED_FILE_WITHOUT_AUDIO="local/${PRESET}-no-audio.mp4"

mkdir -p $TRANSCODE_DIR

echo "Quering S3"
NUM_EXPECTED=$(s3cmd ls -c local/.s3cfg --recursive s3://$BUCKET/segments/$VIDEO_ID/ | wc -l)
NUM_TRANSCODED=$(s3cmd ls -c local/.s3cfg --recursive s3://$BUCKET/transcoded-segments/$VIDEO_ID/$PRESET/ | wc -l)

echo "NUM_EXPECTED $NUM_EXPECTED"
echo "NUM_TRANSCODED $NUM_TRANSCODED"

while ["$NUM_TRANSCODED" -lt "$NUM_EXPECTED"]; do
  sleep 5
  echo "Waiting for transcoded parts"
  echo "NUM_EXPECTED $NUM_EXPECTED"
  echo "NUM_TRANSCODED $NUM_TRANSCODED"
  NUM_TRANSCODED=$(s3cmd ls -c local/.s3cfg --recursive s3://$BUCKET/transcoded-segments/$VIDEO_ID/$PRESET/ | wc -l)
done

echo "Downloading transcoded segments"
s3cmd -c local/.s3cfg sync s3://$BUCKET/transcoded-segments/$VIDEO_ID/$PRESET/ $TRANSCODE_DIR/

echo "Downloading source audio"
s3cmd -c local/.s3cfg sync s3://$BUCKET/audio/$VIDEO_ID/source.wav $AUDIO_PATH

ls local/
ls local/transcoded-segments/

echo "Creating concatination manifest"
for PART in $(ls $TRANSCODE_DIR/); do
  echo "file './transcoded-segments/$PART'" >> $MANIFEST_PATH
done

cat $MANIFEST_PATH

echo "Concatinating video segments"
ffmpeg -y -f concat -threads 1 -safe 0 -i $MANIFEST_PATH -c copy $TRANSCODED_FILE_WITHOUT_AUDIO

echo "Combining source audio with concatinated video"
ffmpeg -y -i $TRANSCODED_FILE_WITHOUT_AUDIO -i $AUDIO_PATH -threads 1 -c:v copy -c:a aac $TRANSCODED_FILE_WITH_AUDIO

echo "Uploading video"
s3cmd -c local/.s3cfg put $TRANSCODED_FILE_WITH_AUDIO s3://$BUCKET/transcoded/$VIDEO_ID/$PRESET.mp4