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

  WASABI_ACCESS_KEY_ID=$(aws ssm get-parameter --name "wasabi_access_key_id" --with-decryption --query 'Parameter.Value' --output text)
  WASABI_SECRET_ACCESS_KEY=$(aws ssm get-parameter --name "wasabi_secret_access_key" --with-decryption --query 'Parameter.Value' --output text)
    
  echo "KEY: $KEY"
  echo "EXT: $EXT"
  echo "PRESET: $PRESET"
  echo "BUCKET: $BUCKET"
  echo "VIDEO_ID: $VIDEO_ID"
  echo "FILENAME: $FILENAME"
  echo "EVENT_NAME: $EVENT_NAME"
  
  aws configure set aws_access_key_id "$WASABI_ACCESS_KEY_ID" --profile wasabi
  aws configure set aws_secret_access_key "$WASABI_SECRET_ACCESS_KEY" --profile wasabi

  if [[ "$BUCKET" == *"prod"* ]]; then
    echo "using prod wasabi bucket"
    WASABI_BUCKET="cdn.bken.io"
    WASABI_HTTP_CDN="cdn.bken.io"
  else
    echo "using dev wasabi bucket"
    WASABI_BUCKET="dev-cdn.bken.io"
    WASABI_HTTP_CDN="dev-cdn.bken.io"
  fi
  
  echo "copying to wasabi"
  aws s3 cp s3://$BUCKET/$KEY - | \
  aws s3 cp - s3://${WASABI_BUCKET}/v/${VIDEO_ID}/${FILENAME} \
  --endpoint=https://us-east-2.wasabisys.com --profile wasabi --content-type "video/$EXT"
  
  echo "removing file from s3"
  aws s3 rm s3://$BUCKET/$KEY

  LINK="https://${WASABI_HTTP_CDN}/v/${VIDEO_ID}/${FILENAME}"
  echo "LINK: $LINK"

  echo "updating tidal database with status"
  aws dynamodb update-item \
    --table-name tidal-dev \
    --key '{"id": {"S": '\"$VIDEO_ID\"'}, "preset": {"S": '\"$PRESET\"'}}' \
    --update-expression 'SET #status = :status, #link = :link' \
    --expression-attribute-names '{"#status":'\"status\"',"#link":'\"link\"'}' \
    --expression-attribute-values '{":status":{"S":"completed"},":link":{"S":'\"$LINK\"'}}'
}