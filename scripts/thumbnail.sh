function handler () {
  set -e
  EVENT_DATA=$1
  
  rm -rf /tmp/*.jpg
  rm -rf /tmp/*.webp

  IN_PATH=$(echo $EVENT_DATA | jq -r '.in_path')
  VIDEO_ID=$(echo $IN_PATH | cut -d'/' -f5)
  FULL_FILENAME=$(echo $IN_PATH | cut -d'/' -f6)

  FILENAME=$(basename -- "$FULL_FILENAME")
  EXT="${FILENAME##*.}"
    
  echo "EXT: $EXT"
  echo "IN_PATH: $IN_PATH"
  echo "VIDEO_ID: $VIDEO_ID"
  echo "FILENAME: $FILENAME"
  echo "FULL_FILENAME: $FULL_FILENAME"
  echo "WASABI_BUCKET: $WASABI_BUCKET"

  echo "creating signed url"
  SIGNED_URL=$(aws s3 presign $IN_PATH)

  echo "querying for wasabi keys"
  WASABI_ACCESS_KEY_ID=$(aws ssm get-parameter --name "wasabi_access_key_id" --with-decryption --query 'Parameter.Value' --output text)
  WASABI_SECRET_ACCESS_KEY=$(aws ssm get-parameter --name "wasabi_secret_access_key" --with-decryption --query 'Parameter.Value' --output text)

  echo "setting up wasabi profile"
  aws configure set aws_access_key_id "$WASABI_ACCESS_KEY_ID" --profile wasabi
  aws configure set aws_secret_access_key "$WASABI_SECRET_ACCESS_KEY" --profile wasabi

  echo "calling ffmpeg"
  /opt/ffmpeg/ffmpeg -y -i "$SIGNED_URL" \
    -s 640x360 \
    -vframes 1 \
    -q:v 40 \
    /tmp/${VIDEO_ID}.webp

  echo "copying to wasabi"
  aws s3 cp /tmp/${VIDEO_ID}.webp s3://${WASABI_BUCKET}/i/${VIDEO_ID}/${VIDEO_ID}.webp \
  --endpoint=https://us-east-2.wasabisys.com --profile wasabi --content-type "image/webp"

  LINK="https://${WASABI_BUCKET}/i/${VIDEO_ID}/${VIDEO_ID}.webp"

  echo "updating tidal database with thumbnail"
  aws dynamodb update-item \
    --table-name videos-dev \
    --key '{"id": {"S": '\"$VIDEO_ID\"'}}' \
    --update-expression 'SET #thumbnail = :thumbnail' \
    --expression-attribute-names '{"#thumbnail":'\"thumbnail\"'}' \
    --expression-attribute-values '{":thumbnail":{"S":'\"$LINK\"'}}'

  rm -rf /tmp/*.jpg
  rm -rf /tmp/*.webp
}
