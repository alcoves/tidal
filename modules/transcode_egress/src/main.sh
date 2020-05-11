function handler () {
  set -e
  EVENT_DATA=$1
  
  EVENT_NAME=$(echo $EVENT_DATA | jq -r '.Records[0].eventName')
  KEY=$(echo $EVENT_DATA | jq -r '.Records[0].s3.object.key')
  BUCKET=$(echo $EVENT_DATA | jq -r '.Records[0].s3.bucket.name')
    
  echo $KEY
  echo $BUCKET
  echo $EVENT_NAME

  if [[ "$BUCKET" == *"prod"* ]]; then
    echo "using prod wasabi bucket"
    WASABI_BUCKET="cdn.bken.io"
  else
    echo "using dev wasabi bucket"
    WASABI_BUCKET="dev-cdn.bken.io"
  fi

  echo "WASABI_BUCKET: $WASABI_BUCKET"
  echo "WASABI_ACCESS_KEY_ID: $WASABI_ACCESS_KEY_ID"
  echo "WASABI_SECRET_ACCESS_KEY: $WASABI_SECRET_ACCESS_KEY"
  
  if [ "$EVENT_NAME" = "ObjectCreated:Put" ]; then
    echo "copying to wasabi"
    aws s3 cp s3://$BUCKET/$KEY - | \
    AWS_ACCESS_KEY_ID=$WASABI_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY=$WASABI_SECRET_ACCESS_KEY \
    aws s3 cp - s3://${WASABI_BUCKET}/${KEY} --endpoint=https://us-east-2.wasabisys.com
  else
    echo "event did not match"
  fi
}
