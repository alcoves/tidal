function handler () {
  set -e
  EVENT_DATA=$1
  
  KEY=$(echo $EVENT_DATA | jq -r '.Records[0].s3.object.key')
  EVENT_NAME=$(echo $EVENT_DATA | jq -r '.Records[0].eventName')
  BUCKET=$(echo $EVENT_DATA | jq -r '.Records[0].s3.bucket.name')

  VIDEO_ID=$(echo $KEY | cut -d'/' -f2)
  FULL_FILENAME=$(echo $KEY | cut -d'/' -f3)

  FILENAME=$(basename -- "$FULL_FILENAME")
  EXT="${FILENAME##*.}"
  PRESET="${FILENAME%.*}"
    
  echo "KEY: $KEY"
  echo "EXT: $EXT"
  echo "PRESET: $PRESET"
  echo "BUCKET: $BUCKET"
  echo "VIDEO_ID: $VIDEO_ID"
  echo "FILENAME: $FILENAME"
  
  aws configure set aws_access_key_id "$WASABI_ACCESS_KEY_ID" --profile wasabi
  aws configure set aws_secret_access_key "$WASABI_SECRET_ACCESS_KEY" --profile wasabi

  if [[ "$BUCKET" == *"prod"* ]]; then
    echo "using prod wasabi bucket"
    WASABI_BUCKET="cdn.bken.io"
  else
    echo "using dev wasabi bucket"
    WASABI_BUCKET="dev-cdn.bken.io"
  fi
  
  if [ "$EVENT_NAME" = "ObjectCreated:Put" ]; then
    echo "copying to wasabi"
    aws s3 cp s3://$BUCKET/$KEY - | \
    aws s3 cp - s3://${WASABI_BUCKET}/v/${VIDEO_ID}/${FILENAME} \
    --endpoint=https://us-east-2.wasabisys.com --profile wasabi --content-type "video/$EXT"
  else
    echo "event did not match"
  fi

  echo "updating tidal database with status"
  aws dynamodb update-item \
    --table-name tidal-dev \
    --key '{"id": {"S": '\"$VIDEO_ID\"'}, "preset": {"S": '\"$PRESET\"'}}' \
    --update-expression 'SET #status = :status' \
    --expression-attribute-names '{"#status":'\"status\"'}' \
    --expression-attribute-values '{":status":{"S":"completed"}}'
}
