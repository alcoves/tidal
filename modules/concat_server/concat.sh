#!/bin/bash
set -u

IN_PATH="$(echo $1)"
OUT_PATH="$(echo $2)"

BUCKET="$(echo $IN_PATH | cut -d'/' -f3)"
echo "BUCKET: ${BUCKET}"

VIDEO_ID="$(echo $IN_PATH | cut -d'/' -f6)"
echo "VIDEO_ID: ${VIDEO_ID}"

PRESET_NAME="$(echo $IN_PATH | cut -d'/' -f7)"
echo "PRESET_NAME: ${PRESET_NAME}"

TMP_DIR=$(mktemp -d)
echo "tmp dir: $TMP_DIR"

echo "creating workdirs"
mkdir -p ${TMP_DIR}/segments
touch ${TMP_DIR}/manifest.txt

echo "downloading segments"
aws s3 sync $IN_PATH $TMP_DIR/segments

for SEGMENT in $(ls ${TMP_DIR}/segments); do
  echo "file 'segments/${SEGMENT}'" >> ${TMP_DIR}/manifest.txt
done

FILE_EXT="${OUT_PATH##*.}"
echo "FILE_EXT: ${FILE_EXT}"

echo "LOCAL_VIDEO_PATH: $LOCAL_VIDEO_PATH"
LOCAL_VIDEO_PATH="${TMP_DIR}/${PRESET_NAME}.${FILE_EXT}"

if [ "$FILE_EXT" = "webm" ]; then
  echo "creating signed audio url"
  SIGNED_AUDIO_URL=$(aws s3 presign s3://${BUCKET}/audio/${VIDEO_ID}/source.ogg)
  FFMPEG_FORMAT="webm"
else
  echo "creating signed audio url"
  SIGNED_AUDIO_URL=$(aws s3 presign s3://${BUCKET}/audio/${VIDEO_ID}/source.aac)
  FFMPEG_FORMAT="mp4"
fi

echo "concatinating started"
ffmpeg -f concat -safe 0 \
  -protocol_whitelist "file,http,https,tcp,tls" \
  -i ${TMP_DIR}/manifest.txt \
  -c copy \
  -f matroska - | \
  ffmpeg \
  -i - -i "$SIGNED_AUDIO_URL" \
  -c:v copy \
  -movflags faststart \
  $LOCAL_VIDEO_PATH

aws s3 cp $LOCAL_VIDEO_PATH $OUT_PATH
echo "concatinating completed"