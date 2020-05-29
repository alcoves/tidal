#!/bin/bash
set -eux

FFMPEG="$(which ffmpeg)"
TMP_DIR="/tmp"
WORKDIR="${TMP_DIR}/tidal"
mkdir -p $WORKDIR

echo "Cleaning up lambda env"
rm -rf $WORKDIR
mkdir -p ${WORKDIR}/links

IN_PATH=$1
OUT_PATH=$2

BUCKET="$(echo $IN_PATH | cut -d'/' -f3)"
echo "BUCKET: ${BUCKET}"

VIDEO_ID="$(echo $IN_PATH | cut -d'/' -f6)"
echo "VIDEO_ID: ${VIDEO_ID}"

PRESET_NAME="$(echo $IN_PATH | cut -d'/' -f7)"
echo "PRESET_NAME: ${PRESET_NAME}"

FILE_EXT="${OUT_PATH##*.}"
echo "FILE_EXT: ${FILE_EXT}"

echo "creating manifest"
touch ${WORKDIR}/manifest.txt

echo "list segments"
SEGMENTS=$(aws s3 ls $IN_PATH --recursive | awk '{print $4}')
echo "SEGMENTS: $SEGMENTS"

# TODO :: Generating links here is slow.
for SEGMENT in $SEGMENTS; do
  echo "file '$(aws s3 presign s3://${BUCKET}/${SEGMENT})'" >> ${WORKDIR}/links/$(echo $SEGMENT | cut -d'/' -f5) &
done
wait

for LINK in $(ls ${WORKDIR}/links); do
  cat ${WORKDIR}/links/$LINK >> ${WORKDIR}/manifest.txt
done

if [ "$FILE_EXT" = "webm" ]; then
  echo "creating signed audio url"
  SIGNED_AUDIO_URL=$(aws s3 presign s3://${BUCKET}/audio/${VIDEO_ID}/source.ogg)
else
  echo "creating signed audio url"
  SIGNED_AUDIO_URL=$(aws s3 presign s3://${BUCKET}/audio/${VIDEO_ID}/source.aac)
fi

echo "concatinating started"
$FFMPEG -f concat -safe 0 \
  -protocol_whitelist "file,http,https,tcp,tls" \
  -i ${WORKDIR}/manifest.txt \
  -c copy \
  -f matroska - | \
  $FFMPEG \
  -i - -i "$SIGNED_AUDIO_URL" \
  -c copy \
  -movflags faststart \
  ${WORKDIR}/out.${FILE_EXT}

echo "uploading video to s3"
aws s3 cp ${WORKDIR}/out.${FILE_EXT} $OUT_PATH

rm -rf $WORKDIR
echo "concatinating completed"