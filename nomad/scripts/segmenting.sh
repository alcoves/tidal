#!/bin/bash
set -e

echo "Setting envs"
BUCKET=$1
VIDEO_ID=$2
FILENAME=$3
TRANSCODE_QUEUE_URL=$4

TMP_DIR="local/$VIDEO_ID"
mkdir -p local/$VIDEO_ID

SEGMENTS_DIR="$TMP_DIR/segments"
SOURCE_VIDEO="$TMP_DIR/$FILENAME"
mkdir -p $SEGMENTS_DIR

AUDIO_FILENAME="source.wav"
AUDIO_PATH="$TMP_DIR/$AUDIO_FILENAME"

echo "Downloading source clip"
aws s3 cp s3://$BUCKET/uploads/$VIDEO_ID/$FILENAME $SOURCE_VIDEO

echo "Exporting audio"
ffmpeg -i $SOURCE_VIDEO -threads 1 $AUDIO_PATH

echo "Uploading audio"
aws s3 cp $AUDIO_PATH s3://$BUCKET/audio/$VIDEO_ID/$AUDIO_FILENAME

echo "Segmenting video"
ffmpeg -i $SOURCE_VIDEO -y -threads 1 -c copy -f segment -segment_time 10 -an $SEGMENTS_DIR/output_%04d.mkv

echo "Segmentation complete"
ls $TMP_DIR
ls $SEGMENTS_DIR

echo "Getting video metadata"
METADATA=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 $SOURCE_VIDEO)
ARR=(${METADATA//,/ })
WIDTH=${ARR[0]}
HEIGHT=${ARR[1]}

echo "Video Width: $WIDTH"
echo "Video Height: $HEIGHT"

echo "Uploading segments"
aws s3 sync $SEGMENTS_DIR s3://$BUCKET/segments/$VIDEO_ID/

for PRESET in "1080p-libx264"; do
  for SEGMENT in $(ls $SEGMENTS_DIR); do
    echo "enqueing $PRESET:$SEGMENT"
    FILE_PATH=$TMP_DIR/${PRESET}-${SEGMENT}.json

    jq -n \
    --arg shouldConcat false \
    --arg inPath "$BUCKET/segments/$VIDEO_ID/$SEGMENT" \
    --arg outPath "$BUCKET/transcoded-segments/$VIDEO_ID/$PRESET/$SEGMENT" \
    --arg ffmpegCommand "-c:v libx264 -profile:v high -vf scale=1080:-2 -coder 1 -pix_fmt yuv420p -bf 2 -crf 27 -preset slow -f matroska" \
    '{
      Meta: {
        inPath:$inPath,
        outPath:$outPath,
        shouldConcat:$shouldConcat,
        ffmpegCommand:$ffmpegCommand
      }
    }' \
    > $FILE_PATH

    aws sqs send-message \
      --region us-east-1 \
      --queue-url $TRANSCODE_QUEUE_URL \
      --message-body "file://$FILE_PATH"
  done

  nomad job dispatch -detach \
    -meta "preset=$PRESET" \
    -meta "bucket=$BUCKET" \
    -meta "video_id=$VIDEO_ID" \
    concatinating
done

echo "Segmenting success!"
