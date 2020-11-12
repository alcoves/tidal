#!/bin/bash
set -e

echo "starting video conversion process"

S3_IN=$1
TIDAL_PATH=${2:-"/root/tidal"}
BENTO="/usr/local/bin/bento/bin"

echo "TIDAL_PATH: $TIDAL_PATH"
echo "BENTO: $BENTO"

BUCKET="$(echo $S3_IN | cut -d'/' -f3)"
echo "BUCKET: ${BUCKET}"

VIDEO_ID="$(echo $S3_IN | cut -d'/' -f4)"
echo "VIDEO_ID: ${VIDEO_ID}"

VIDEO_EXTENSION="${S3_IN##*.}"
echo "VIDEO_EXTENSION: ${VIDEO_EXTENSION}"

echo "cleaing up digitalocean"
aws s3 rm \
  s3://${BUCKET}/${VIDEO_ID} \
  --quiet \
  --recursive \
  --exclude "source.*" \
  --profile digitalocean \
  --endpoint=https://nyc3.digitaloceanspaces.com

echo "cleaing up wasabi"
aws s3 rm \
  s3://cdn.bken.io/v/${VIDEO_ID} \
  --quiet \
  --recursive \
  --profile wasabi \
  --endpoint=https://us-east-2.wasabisys.com

echo "downloading source video"
SOURCE_VIDEO_DIR=$(mktemp -d)
aws s3 cp $S3_IN $SOURCE_VIDEO_DIR/ \
  --quiet \
  --profile digitalocean \
  --endpoint=https://nyc3.digitaloceanspaces.com
SOURCE_VIDEO=$(ls $SOURCE_VIDEO_DIR)
SOURCE_VIDEO="$SOURCE_VIDEO_DIR/$SOURCE_VIDEO"
echo "SOURCE_VIDEO: $SOURCE_VIDEO"

echo "creating tmp dir"
TMP_DIR=$(mktemp -d)
echo "TMP_DIR: $TMP_DIR"

echo "getting presets"
PRESETS=$(node $TIDAL_PATH/src/services/getPresets.js "$SOURCE_VIDEO" | jq -r '.presets')

echo "dispatching transcoding jobs"

#### Distributed transcode test ####
# seperate audio
AUDIO_PATH=$(mktemp --suffix=.mp4)
SEGMENTS_DIR=$(mktemp -d)

# split audio
ffmpeg -hide_banner -y -i $SOURCE_VIDEO -vn $AUDIO_PATH

# create segments
VIDEO_EXTENSION="${SOURCE_VIDEO##*.}"
echo "VIDEO_EXTENSION: $VIDEO_EXTENSION"
ffmpeg -hide_banner -y -i "$SOURCE_VIDEO" -an -c:v copy -f segment -segment_time 10 $SEGMENTS_DIR/%09d.$VIDEO_EXTENSION

for row in $(echo "$PRESETS" | jq -r '.[] | @base64'); do
  PRESET=$(echo ${row} | base64 --decode | jq -r '.')
  CMD=$(echo $PRESET | jq -r '.cmd')
  PRESET_NAME=$(echo $PRESET | jq -r '.preset')

  # echo "creating preset $PRESET_NAME"
  # ffmpeg -hide_banner -y -i "$SOURCE_VIDEO" $CMD $TMP_DIR/$PRESET_NAME.mp4

  #### Distributed transcode test ####
  MANIFEST=$(mktemp)
  TMP_SEG_DIR=$(mktemp -d)
  PLAYLIST="$TMP_DIR/stream.m3u8"

  echo "#EXTM3U" >> $PLAYLIST
  echo "#EXT-X-VERSION:3" >> $PLAYLIST
  echo "#EXT-X-PLAYLIST-TYPE:VOD" >> $PLAYLIST
  echo "#EXT-X-MEDIA-SEQUENCE:0" >> $PLAYLIST
  echo "#EXT-X-TARGETDURATION:$DURATION" >> $PLAYLIST

  # encode segments
  for SEG in $(ls $SEGMENTS_DIR); do
    ffmpeg -hide_banner -y -i $SEGMENTS_DIR/$SEG $CMD -f mpegts $TMP_SEG_DIR/$SEG.ts
    DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $TMP_SEG_DIR/$SEG.ts)
    echo "#EXTINF:$DURATION," >> $PLAYLIST
    echo "out.ts" >> $PLAYLIST
    # echo "file '${TMP_SEG_DIR}/${SEG}'" >> $MANIFEST
  done;

  echo "#EXT-X-ENDLIST" >> $PLAYLIST

  # stitch transcodes
  # ffmpeg -hide_banner -y -f concat -safe 0 \
  #   -i $MANIFEST \
  #   -c copy \
  #   $TMP_DIR/$PRESET_NAME.mp4

  # creating master playlist
  echo "# 144p" >> $TMP_DIR/master.m3u8
  echo "#EXT-X-STREAM-INF:BANDWIDTH=5215621,RESOLUTION=640x360" >> $TMP_DIR/master.m3u8
  echo "stream.m3u8" >> $TMP_DIR/master.m3u8

  #################################

  # echo "creating hls segments"
  # $BENTO/mp4hls -f -o $TMP_DIR/hls --master-playlist-name=master.m3u8 $TMP_DIR/*.mp4 $AUDIO_PATH
  
  rm -rf $TMP_SEG_DIR

  echo "uploading to cdn"
  aws s3 sync \
    $TMP_DIR \
    s3://cdn.bken.io/v/$VIDEO_ID/ \
    --quiet \
    --profile wasabi \
    --endpoint=https://us-east-2.wasabisys.com
done

echo "removing tmp dirs"
rm -rf $TMP_DIR
rm -rf $SOURCE_VIDEO_DIR

echo "done!"
