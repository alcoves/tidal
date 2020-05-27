#!/bin/bash
set -eux

IN_PATH="$(echo $1)"
OUT_PATH="$(echo $2)"
BASE_DIR=$(echo $3)

BUCKET="$(echo $IN_PATH | cut -d'/' -f3)"
echo "BUCKET: ${BUCKET}"

VIDEO_ID="$(echo $IN_PATH | cut -d'/' -f6)"
echo "VIDEO_ID: ${VIDEO_ID}"

PRESET_NAME="$(echo $IN_PATH | cut -d'/' -f7)"
echo "PRESET_NAME: ${PRESET_NAME}"

TMP_DIR=${BASE_DIR}/${VIDEO_ID}/${PRESET_NAME}
rm -rf $TMP_DIR
mkdir -p $TMP_DIR
echo "tmp dir: $TMP_DIR"

echo "creating workdirs"
mkdir -p ${TMP_DIR}/segments
touch ${TMP_DIR}/manifest.txt

echo "downloading segments"
aws s3 sync $IN_PATH $TMP_DIR/segments --quiet

for SEGMENT in $(ls ${TMP_DIR}/segments); do
  echo "file 'segments/${SEGMENT}'" >> ${TMP_DIR}/manifest.txt
done

FILE_EXT="${OUT_PATH##*.}"
echo "FILE_EXT: ${FILE_EXT}"

LOCAL_VIDEO_PATH="${TMP_DIR}/${PRESET_NAME}.${FILE_EXT}"
echo "LOCAL_VIDEO_PATH: $LOCAL_VIDEO_PATH"

if [ "$FILE_EXT" = "webm" ]; then
  FFMPEG_FORMAT="webm"
  AUDIO_FILENAME="source.ogg"
else
  FFMPEG_FORMAT="mp4"
  AUDIO_FILENAME="source.aac"
fi

echo "downloading audio"
aws s3 cp s3://${BUCKET}/audio/${VIDEO_ID}/${AUDIO_FILENAME} ${TMP_DIR}/${AUDIO_FILENAME} --quiet

echo "concatinating segments"
ffmpeg -hide_banner -loglevel panic -f concat -safe 0 \
  -i ${TMP_DIR}/manifest.txt \
  -c:v copy \
  ${TMP_DIR}/premux.mkv

echo "remuxing with audio"
ffmpeg -hide_banner -loglevel panic -i $TMP_DIR/premux.mkv \
  -i ${TMP_DIR}/${AUDIO_FILENAME} \
  -c:v copy \
  -movflags faststart \
  $LOCAL_VIDEO_PATH

echo "uploading to s3"
aws s3 cp $LOCAL_VIDEO_PATH $OUT_PATH --quiet

rm -rf $TMP_DIR
echo "concatinating completed"