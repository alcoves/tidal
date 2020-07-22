#!/bin/bash
set -e

IN_PATH=$1
OUT_PATH=$2

BUCKET="$(echo $IN_PATH | cut -d'/' -f3)"
echo "BUCKET: ${BUCKET}"

TIDAL_ENV="$(echo $BUCKET | cut -d'-' -f3)"
echo "TIDAL_ENV: ${TIDAL_ENV}"

VIDEO_ID="$(echo $IN_PATH | cut -d'/' -f5)"
echo "VIDEO_ID: ${VIDEO_ID}"

PRESET_NAME="$(echo $IN_PATH | cut -d'/' -f6)"
echo "PRESET_NAME: ${PRESET_NAME}"

WASABI_BUCKET="$(echo $OUT_PATH | cut -d'/' -f3)"
echo "WASABI_BUCKET: ${WASABI_BUCKET}"

VIDEO_EXTENSION="${OUT_PATH##*.}"
echo "VIDEO_EXTENSION: ${VIDEO_EXTENSION}"

echo "creating tmp dir"
TMP_DIR=$(mktemp -d)
mkdir $TMP_DIR/audio
mkdir $TMP_DIR/segments
echo "TMP_DIR: $TMP_DIR"

TMP_VIDEO_PATH="${TMP_DIR}/${PRESET_NAME}.${VIDEO_EXTENSION}"
echo "TMP_VIDEO_PATH: $TMP_VIDEO_PATH"

echo "creating manifest"
MANIFEST=${TMP_DIR}/manifest.txt
touch $MANIFEST

echo "download segments"
aws s3 sync $IN_PATH $TMP_DIR/segments

for SEGMENT in $(ls $TMP_DIR/segments); do
  echo "file '${TMP_DIR}/segments/${SEGMENT}'" >> $MANIFEST
done

if [ "$VIDEO_EXTENSION" = "webm" ]; then
  AUDIO_EXT="ogg"
else 
  AUDIO_EXT="aac"
fi

AUDIO_PATH="${TMP_DIR}/audio/source.${AUDIO_EXT}"

echo "AUDIO_EXT: $AUDIO_EXT"
echo "AUDIO_PATH: $AUDIO_PATH"

echo "downloading audio"
aws s3 cp s3://${BUCKET}/audio/${VIDEO_ID}/source.${AUDIO_EXT} $AUDIO_PATH

echo "concatinating started"
# -hide_banner -loglevel panic
ffmpeg -y -f concat -safe 0 \
  -i $MANIFEST \
  -c copy \
  -f matroska - | \
  ffmpeg \
  -y -i - -i $AUDIO_PATH \
  -c copy \
  -movflags faststart \
  $TMP_VIDEO_PATH

WASABI_ACCESS_KEY_ID=$(aws ssm get-parameter --name "wasabi_access_key_id" --with-decryption --query 'Parameter.Value' --output text)
WASABI_SECRET_ACCESS_KEY=$(aws ssm get-parameter --name "wasabi_secret_access_key" --with-decryption --query 'Parameter.Value' --output text)

aws configure set aws_access_key_id "$WASABI_ACCESS_KEY_ID" --profile wasabi
aws configure set aws_secret_access_key "$WASABI_SECRET_ACCESS_KEY" --profile wasabi

echo "copying to wasabi"
aws s3 mv $TMP_VIDEO_PATH $OUT_PATH \
  --profile wasabi \
  --content-type "video/$VIDEO_EXTENSION" \
  --endpoint=https://us-east-2.wasabisys.com

CDN_PROTOCAL="https"
LINK="${OUT_PATH/s3/$CDN_PROTOCAL}"
echo "LINK: $LINK"

echo "updating tidal database with status"
aws dynamodb update-item \
  --table-name "tidal-${TIDAL_ENV}" \
  --key '{"id": {"S": '\"$VIDEO_ID\"'}' \
  --update-expression 'SET #status = :status, #link = :link' \
  --expression-attribute-names '{"#status":'\"versions.${PRESET_NAME}.status\"',"#link":'\"versions.${PRESET_NAME}.link\"'}' \
  --expression-attribute-values '{":status":{"S":"completed"},":link":{"S":'\"$LINK\"'}}'

echo "removing tmp dir"
rm -rf $TMP_DIR