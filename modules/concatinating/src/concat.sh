#!/bin/bash
set -e

IN_PATH=$1
OUT_PATH=$2
TMP_DIR=$3
FFMPEG="/opt/ffmpeg/ffmpeg"
LAMBDA_TMP_DIR="/tmp"

VIDEO_ID="$(echo $IN_PATH | cut -d'/' -f6)"
echo "VIDEO_ID: ${VIDEO_ID}"

PRESET_NAME="$(echo $IN_PATH | cut -d'/' -f7)"
echo "PRESET_NAME: ${PRESET_NAME}"

FILE_EXT="${OUT_PATH##*.}"
echo "FILE_EXT: ${FILE_EXT}"

echo "Cleaning up lambda env"
WORKDIR="${LAMBDA_TMP_DIR}/${VIDEO_ID}"
rm -rf $WORKDIR
mkdir -p $WORKDIR

echo "creating manifest"
touch ${WORKDIR}/manifest.txt

echo "list segments"
SEGMENTS=$(ls /mnt/tidal/segments/transcoded/${VIDEO_ID}/${PRESET_NAME})
echo "SEGMENTS: $SEGMENTS"

for SEGMENT in $SEGMENTS; do
  echo "file '/mnt/tidal/segments/transcoded/${VIDEO_ID}/${PRESET_NAME}/${SEGMENT}'" >> ${WORKDIR}/manifest.txt
done

if [ "$FILE_EXT" = "webm" ]; then
  AUDIO_URL="https://tidal-bken-dev.s3.amazonaws.com/audio/${VIDEO_ID}/source.ogg"
else
  AUDIO_URL="https://tidal-bken-dev.s3.amazonaws.com/audio/${VIDEO_ID}/source.aac"
fi

echo "AUDIO_URL: $AUDIO_URL"
VIDEO_STORE_PATH="${TMP_DIR}/${VIDEO_ID}-${PRESET_NAME}.${FILE_EXT}"
S3_STORE_PATH="s3://tidal-bken-dev/v/${VIDEO_ID}/${PRESET_NAME}.${FILE_EXT}"

echo "concatinating started"
# -hide_banner -loglevel panic
$FFMPEG -y -f concat -safe 0 \
  -i ${WORKDIR}/manifest.txt \
  -c copy \
  -f matroska - | \
  $FFMPEG \
  -y -i - -i "$AUDIO_URL" \
  -c copy \
  -movflags faststart \
  ${VIDEO_STORE_PATH}
  
echo "moving video from efs to s3"
aws s3 mv $VIDEO_STORE_PATH $S3_STORE_PATH --quiet

rm -rf $WORKDIR
rm -rf $VIDEO_STORE_PATH
echo "concatinating completed"