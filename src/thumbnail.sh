#!/bin/bash
set -eux

IN_PATH=$1
OUT_PATH=$2
CMD=$3

echo "setting up digitalocean profile"
aws configure set aws_access_key_id "$(consul kv get DO_ACCESS_KEY_ID | jq -r '.')" --profile digitalocean
aws configure set aws_secret_access_key "$(consul kv get DO_SECRET | jq -r '.')" --profile wasabi

echo "setting up wasabi profile"
aws configure set aws_access_key_id "$(consul kv get WASABI_ACCESS_KEY_ID | jq -r '.')" --profile wasabi
aws configure set aws_secret_access_key "$(consul kv get WASABI_SECRET_ACCESS_KEY | jq -r '.')" --profile wasabi

BUCKET="$(echo $IN_PATH | cut -d'/' -f3)"
echo "BUCKET: ${BUCKET}"

VIDEO_ID="$(echo $IN_PATH | cut -d'/' -f5)"
echo "VIDEO_ID: ${VIDEO_ID}"

WASABI_BUCKET="$(echo $OUT_PATH | cut -d'/' -f3)"
echo "WASABI_BUCKET: ${WASABI_BUCKET}"

echo "creating signed url"
SIGNED_URL=$(aws s3 presign $IN_PATH --profile digitalocean --endpoint=https://nyc3.digitaloceanspaces.com)

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

echo "updating database"
DB_CONNECTION_STRING=$(consul kv get DB_CONNECTION_STRING | jq -r '.')

OPERATOR='$set'
QUERY="{\"_id\":\"$VIDEO_ID\"}"
UPDATE="{\"$OPERATOR\":{\"thumbnail\":\"$LINK\"}}"

mongo $DB_CONNECTION_STRING --eval "db.videos.updateOne($QUERY, $UPDATE)"

echo "cleaning up tmp dir"
rm -rf $TMP_DIR

echo "thumbnail creation success"
