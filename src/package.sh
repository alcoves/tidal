#!/bin/bash
set -e

IN_PATH=$1
OUT_PATH=$2

BUCKET="$(echo $IN_PATH | cut -d'/' -f3)"
echo "BUCKET: ${BUCKET}"

VIDEO_ID="$(echo $IN_PATH | cut -d'/' -f4)"
echo "VIDEO_ID: ${VIDEO_ID}"

PRESET_NAME="$(echo $IN_PATH | cut -d'/' -f6)"
echo "PRESET_NAME: ${PRESET_NAME}"

echo "creating tmp dir"
TMP_DIR=$(mktemp -d)
echo "TMP_DIR: $TMP_DIR"

echo "downloading transcoded segments"
mkdir -p $TMP_DIR/segments
aws s3 sync \
  $IN_PATH \
  $TMP_DIR/segments \
  --quiet \
  --profile digitalocean \
  --endpoint=https://nyc3.digitaloceanspaces.com

echo "creating concatination manifest"
MANIFEST="$TMP_DIR/manifest.txt"
for SEGMENT in $(ls $TMP_DIR/segments); do
  echo "file '${TMP_DIR}/segments/${SEGMENT}'" >> $MANIFEST
done

echo "concatinating segments"
CONCATINATED_VIDEO_PATH="$TMP_DIR/concatinated.mkv"
ffmpeg -hide_banner -y -f concat -safe 0 \
  -i $MANIFEST \
  -c copy \
  $CONCATINATED_VIDEO_PATH
rm -rf $TMP_DIR/segments

echo "downloading audio"
AUDIO_PATH_COUNT=$(aws s3 ls s3://${BUCKET}/${VIDEO_ID}/audio.aac --profile digitalocean --endpoint=https://nyc3.digitaloceanspaces.com | wc -l)

if [ "$AUDIO_PATH_COUNT" -gt 0 ]; then
  echo "has audio"
  AUDIO_PATH="${TMP_DIR}/audio.aac"
  echo "AUDIO_PATH: $AUDIO_PATH"

  echo "downloading audio"
  aws s3 cp \
    s3://${BUCKET}/${VIDEO_ID}/audio.aac \
    $AUDIO_PATH \
    --quiet \
    --profile digitalocean \
    --endpoint=https://nyc3.digitaloceanspaces.com

  AUDIO_CMD="-i ${AUDIO_PATH}"
else
  echo "video does not contain audio"
  AUDIO_CMD=""
fi

echo "muxing video with original audio"
MUXED_VIDEO_PATH="$TMP_DIR/$PRESET_NAME.mp4"
ffmpeg -hide_banner -y -i $CONCATINATED_VIDEO_PATH \
  $AUDIO_CMD \
  -c copy \
  -movflags faststart \
  $MUXED_VIDEO_PATH
rm -rf $AUDIO_PATH
rm -rf $CONCATINATED_VIDEO_PATH

echo "creating hls assets"
HLS_DIR="$TMP_DIR/hls" 
mkdir -p $HLS_DIR
ffmpeg -y \
  -i $MUXED_VIDEO_PATH \
  -hls_time 6 \
  -hls_playlist_type vod \
  -hls_segment_type fmp4 \
  -hls_segment_filename "$HLS_DIR/%09d.m4s" \
  $HLS_DIR/stream.m3u8

echo "publishing hls assets to cdn"
aws s3 cp $HLS_DIR s3://cdn.bken.io/v/${VIDEO_ID}/hls/$PRESET_NAME \
  --quiet \
  --recursive \
  --profile wasabi \
  --endpoint=https://us-east-2.wasabisys.com

echo "creating master"
# TODO :: Need to merge master.m3u8 to support all variations
HLS_MASTER="$TMP_DIR/master.m3u8"
echo "# preset:$PRESET_NAME" >> $HLS_MASTER
# TODO :: Calculate these values
echo "#EXT-X-STREAM-INF:BANDWIDTH=5215621,RESOLUTION=640x360" >> $HLS_MASTER
echo "$PRESET_NAME/stream.m3u8" >> $HLS_MASTER

echo "uploading $HLS_MASTER"
aws s3 cp $HLS_MASTER s3://cdn.bken.io/v/${VIDEO_ID}/master.m3u8 \
  --quiet \
  --profile wasabi \
  --endpoint=https://us-east-2.wasabisys.com

echo "moving $MUXED_VIDEO_PATH to cdn"
aws s3 cp $MUXED_VIDEO_PATH s3://cdn.bken.io/v/${VIDEO_ID}/progressive/ \
  --quiet \
  --profile wasabi \
  --endpoint=https://us-east-2.wasabisys.com

echo "removing $TMP_DIR"
rm -rf $TMP_DIR

echo "done!"