#!/bin/bash
set -e

echo "Setting env"
PRESET=$1
BUCKET=$2
VIDEO_ID=$3

TMP_DIR="local/$VIDEO_ID"
mkdir -p $TMP_DIR

AUDIO_PATH="$TMP_DIR/source.wav"
MANIFEST_PATH="$TMP_DIR/manifest.txt"
TRANSCODE_DIR="$TMP_DIR/transcoded-segments"
TRANSCODED_FILE_WITH_AUDIO="$TMP_DIR/${PRESET}.mp4"
TRANSCODED_FILE_WITHOUT_AUDIO="$TMP_DIR/${PRESET}-no-audio.mp4"

mkdir -p $TRANSCODE_DIR

echo "Quering S3"
NUM_EXPECTED=$(aws s3 ls s3://$BUCKET/segments/$VIDEO_ID/ | wc -l)
NUM_TRANSCODED=$(aws s3 ls s3://$BUCKET/transcoded-segments/$VIDEO_ID/$PRESET/ | wc -l)

echo "NUM_EXPECTED $NUM_EXPECTED"
echo "NUM_TRANSCODED $NUM_TRANSCODED"

while [ "$NUM_TRANSCODED" -ne "$NUM_EXPECTED" ]; do
  sleep 5
  echo "Waiting for transcoded parts"
  echo "NUM_EXPECTED $NUM_EXPECTED"
  echo "NUM_TRANSCODED $NUM_TRANSCODED"
  NUM_TRANSCODED=$(aws s3 ls s3://$BUCKET/transcoded-segments/$VIDEO_ID/$PRESET/ | wc -l)
done

echo "Downloading transcoded segments"
aws s3 sync s3://$BUCKET/transcoded-segments/$VIDEO_ID/$PRESET $TRANSCODE_DIR

echo "Downloading source audio"
aws s3 cp s3://$BUCKET/audio/$VIDEO_ID/source.wav $TMP_DIR/source.wav

echo "Creating concatination manifest"
for PART in $(ls $TRANSCODE_DIR/); do
  echo "file './transcoded-segments/$PART'" >> $MANIFEST_PATH
done

echo "Concatinating video segments"
ffmpeg -y -f concat -safe 0 -i $MANIFEST_PATH -c copy $TRANSCODED_FILE_WITHOUT_AUDIO

echo "Combining source audio with concatinated video"
ffmpeg -y -i $TRANSCODED_FILE_WITHOUT_AUDIO -i $AUDIO_PATH -c:v copy -c:a aac $TRANSCODED_FILE_WITH_AUDIO

echo "Uploading video"
aws s3 cp $TRANSCODED_FILE_WITH_AUDIO s3://$BUCKET/transcoded/$VIDEO_ID/${PRESET}.mp4

echo "Concatinating success!"
