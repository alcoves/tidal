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
  AUDIO_PATH="/mnt/tidal/audio/${VIDEO_ID}/source.ogg"
else
  AUDIO_PATH="/mnt/tidal/audio/${VIDEO_ID}/source.aac"
fi

echo "AUDIO_PATH: $AUDIO_PATH"
VIDEO_STORE_PATH="${TMP_DIR}/${VIDEO_ID}-${PRESET_NAME}.${FILE_EXT}"
S3_STORE_PATH="s3://tidal-bken-dev/v/${VIDEO_ID}/${PRESET_NAME}.${FILE_EXT}"

echo "concatinating started"
# -hide_banner -loglevel panic
$FFMPEG -y -f concat -safe 0 \
  -i ${WORKDIR}/manifest.txt \
  -c copy \
  -f matroska - | \
  $FFMPEG \
  -y -i - -i $AUDIO_PATH \
  -c copy \
  -movflags faststart \
  ${VIDEO_STORE_PATH}


#################################
# Fully replaces cdn_egress lambda if this works
echo "TESTING WASABI UPLOAD"

aws configure set aws_access_key_id "$WASABI_ACCESS_KEY_ID" --profile wasabi
aws configure set aws_secret_access_key "$WASABI_SECRET_ACCESS_KEY" --profile wasabi

WASABI_BUCKET="dev-cdn.bken.io"
WASABI_HTTP_CDN="dev-cdn.bken.io"

# if [[ "$BUCKET" == *"prod"* ]]; then
#   echo "using prod wasabi bucket"
#   WASABI_BUCKET="cdn.bken.io"
#   WASABI_HTTP_CDN="cdn.bken.io"
# else
#   echo "using dev wasabi bucket"
#   WASABI_BUCKET="dev-cdn.bken.io"
#   WASABI_HTTP_CDN="dev-cdn.bken.io"
# fi

echo "copying to wasabi"
aws s3 cp $VIDEO_STORE_PATH s3://${WASABI_BUCKET}/v/${VIDEO_ID}/${PRESET_NAME}.${EXT} \
--endpoint=https://us-east-2.wasabisys.com --profile wasabi --content-type "video/$EXT"

LINK="https://${WASABI_HTTP_CDN}/v/${VIDEO_ID}/${PRESET_NAME}.${EXT}"
echo "LINK: $LINK"

echo "updating tidal database with status"
aws dynamodb update-item \
  --table-name tidal-dev \
  --key '{"id": {"S": '\"$VIDEO_ID\"'}, "preset": {"S": '\"$PRESET_NAME\"'}}' \
  --update-expression 'SET #status = :status, #link = :link' \
  --expression-attribute-names '{"#status":'\"status\"',"#link":'\"link\"'}' \
  --expression-attribute-values '{":status":{"S":"completed"},":link":{"S":'\"$LINK\"'}}'

#################################

echo "moving video from efs to s3"
aws s3 mv $VIDEO_STORE_PATH $S3_STORE_PATH --quiet

rm -rf $WORKDIR
rm -rf $VIDEO_STORE_PATH
echo "concatinating completed"