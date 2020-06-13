#!/bin/bash
set -e

# FFMPEG="ffmpeg"
FFMPEG="/opt/ffmpeg/ffmpeg"
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

for SEGMENT in $SEGMENTS; do
  echo "file 'https://${BUCKET}.s3.amazonaws.com/${SEGMENT}'" >> ${WORKDIR}/links/$(echo $SEGMENT | cut -d'/' -f5)
done

for LINK in $(ls ${WORKDIR}/links); do
  cat ${WORKDIR}/links/$LINK >> ${WORKDIR}/manifest.txt
done

if [ "$FILE_EXT" = "webm" ]; then
  AUDIO_URL="https://${BUCKET}.s3.amazonaws.com/audio/${VIDEO_ID}/source.ogg"
else
  AUDIO_URL="https://${BUCKET}.s3.amazonaws.com/audio/${VIDEO_ID}/source.aac"
fi

echo "AUDIO_URL: $AUDIO_URL"

echo "concatinating started"
$FFMPEG -hide_banner -loglevel panic -f concat -safe 0 \
  -protocol_whitelist "file,http,https,tcp,tls" \
  -i ${WORKDIR}/manifest.txt \
  -c copy \
  -f matroska - | \
  $FFMPEG -hide_banner -loglevel panic \
  -i - -i "$AUDIO_URL" \
  -c copy \
  -movflags faststart \
  ${WORKDIR}/out.${FILE_EXT}
  
echo "setting up wasabi client"
WASABI_ACCESS_KEY_ID=$(aws ssm get-parameter --name "wasabi_access_key_id" --with-decryption --query 'Parameter.Value' --output text)
WASABI_SECRET_ACCESS_KEY=$(aws ssm get-parameter --name "wasabi_secret_access_key" --with-decryption --query 'Parameter.Value' --output text)
aws configure set aws_access_key_id "$WASABI_ACCESS_KEY_ID" --profile wasabi
aws configure set aws_secret_access_key "$WASABI_SECRET_ACCESS_KEY" --profile wasabi

if [[ "$BUCKET" == *"prod"* ]]; then
  echo "using prod wasabi bucket"
  WASABI_BUCKET="cdn.bken.io"
else
  echo "using dev wasabi bucket"
  WASABI_BUCKET="dev-cdn.bken.io"
fi

echo "uploading video to cdn"
aws s3 mv ${WORKDIR}/out.${FILE_EXT} s3://${WASABI_BUCKET}/v/${VIDEO_ID}/${PRESET_NAME}.${FILE_EXT} \
--endpoint=https://us-east-2.wasabisys.com --profile wasabi --content-type "video/$FILE_EXT" --quiet

LINK="https://${WASABI_BUCKET}/v/${VIDEO_ID}/${PRESET_NAME}.${FILE_EXT}"
echo "LINK: $LINK"

echo "updating tidal database with status"
aws dynamodb update-item \
  --table-name tidal-dev \
  --key '{"id": {"S": '\"$VIDEO_ID\"'}, "preset": {"S": '\"$PRESET\"'}}' \
  --update-expression 'SET #status = :status, #link = :link' \
  --expression-attribute-names '{"#status":'\"status\"',"#link":'\"link\"'}' \
  --expression-attribute-values '{":status":{"S":"completed"},":link":{"S":'\"$LINK\"'}}'

rm -rf $WORKDIR
echo "concatinating completed"