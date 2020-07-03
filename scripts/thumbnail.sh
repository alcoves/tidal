#!/bin/bash

IN_PATH=$1
OUT_PATH=$2
CMD=$3

BUCKET="$(echo $IN_PATH | cut -d'/' -f3)"
echo "BUCKET: ${BUCKET}"

TIDAL_ENV="$(echo $BUCKET | cut -d'-' -f3)"
echo "TIDAL_ENV: ${TIDAL_ENV}"

VIDEO_ID="$(echo $IN_PATH | cut -d'/' -f5)"
echo "VIDEO_ID: ${VIDEO_ID}"

WASABI_BUCKET="$(echo $OUT_PATH | cut -d'/' -f3)"
echo "WASABI_BUCKET: ${WASABI_BUCKET}"

echo "creating signed url"
SIGNED_URL=$(aws s3 presign $IN_PATH)

echo "querying for wasabi keys"
WASABI_ACCESS_KEY_ID=$(aws ssm get-parameter --name "wasabi_access_key_id" --with-decryption --query 'Parameter.Value' --output text)
WASABI_SECRET_ACCESS_KEY=$(aws ssm get-parameter --name "wasabi_secret_access_key" --with-decryption --query 'Parameter.Value' --output text)

echo "setting up wasabi profile"
aws configure set aws_access_key_id "$WASABI_ACCESS_KEY_ID" --profile wasabi
aws configure set aws_secret_access_key "$WASABI_SECRET_ACCESS_KEY" --profile wasabi

echo "creating tmp dir"
TMP_DIR=$(mktemp -d)

echo "picture path"
THUMB_PATH="${TMP_DIR}/${VIDEO_ID}.webp"

echo "calling ffmpeg"
ffmpeg -y -i "$SIGNED_URL" $CMD $THUMB_PATH

echo "copying to wasabi"
aws s3 mv $THUMB_PATH $OUT_PATH \
  --profile wasabi --content-type "image/webp" \
  --endpoint=https://us-east-2.wasabisys.com

CDN_PROTOCAL="https"
LINK="${OUT_PATH/s3/$CDN_PROTOCAL}"
echo "link to image: $LINK"

echo "updating tidal database with thumbnail"
aws dynamodb update-item \
  --table-name "videos-${TIDAL_ENV}" \
  --key '{"id": {"S": '\"$VIDEO_ID\"'}}' \
  --update-expression 'SET #thumbnail = :thumbnail' \
  --expression-attribute-names '{"#thumbnail":'\"thumbnail\"'}' \
  --expression-attribute-values '{":thumbnail":{"S":'\"$LINK\"'}}'

echo "cleaning up tmp dir"
rm -rf $TMP_DIR

echo "thumbnail creation success"
