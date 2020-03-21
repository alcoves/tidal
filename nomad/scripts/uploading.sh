#!/bin/bash
set -e

UPLOAD_QUEUE_URL=$1
TRANSCODE_QUEUE_URL=$2

echo "$UPLOAD_QUEUE_URL"
echo "$TRANSCODE_QUEUE_URL"

# QUEUE_POLL_RESPONSE=$(aws sqs receive-message --max-number-of-messages 1 --region us-east-1 --output json --queue-url $UPLOAD_QUEUE_URL)
# echo $QUEUE_POLL_RESPONSE

MESSAGES=$(echo $QUEUE_POLL_RESPONSE | jq -r '.Messages')
echo $MESSAGES

TEST='{ "Messages": [ { "MessageId": "ecb7701b-a39a-49c4-98a5-7736aae464ed", "ReceiptHandle": "AQEByifZvBBetY3gE2AW6vRnsfJ5GBa+MIpUEpcdROdtZPfw+F4Io7PENynyQkUyRinwH/PkFJt16EsOlTrZATWUDGuAoIhcj1eBUPwqul932bOAZsJl/GxSYTYxVCNdTdMwZ4CnbGEHderbEyPFIO5sNA+IHaVctZn8b4m/aUv3T5IlCgII+WdQEA4oSCNkpxKWI2kku+YQLcEdGS++2cI61qkB7AVcdpqdoHACSm7aLSmUELH8o6Ozv+xgCDgLjKyecz4cbPvDZ2Vdh6dlvs+amFKclr0vxv/A0ejjLppWh+EaAz34Sm8qJGNqXWQdNt8VLg79hBSO4KMbuTO3UH+vj/CGjzJQUldc3L5Y8LP0qegkzzMreIikYyhvWXPCZf7AzpzM3w7+b15lkakdaeTqyQ==", "MD5OfBody": "fc2740d9059cbb03488d628d842549e6", "Body": "{\"Records\":[{\"eventVersion\":\"2.1\",\"eventSource\":\"aws:s3\",\"awsRegion\":\"us-east-1\",\"eventTime\":\"2020-03-20T23:06:54.834Z\",\"eventName\":\"ObjectCreated:CompleteMultipartUpload\",\"userIdentity\":{\"principalId\":\"A3DM7NBP99T08P\"},\"requestParameters\":{\"sourceIPAddress\":\"162.225.189.133\"},\"responseElements\":{\"x-amz-request-id\":\"E58D7A6ACC99B7DC\",\"x-amz-id-2\":\"yjncmgW7zsBVM0wk/OwFF6ZrwZF1QbMFmLYVK1W+77OwltN0LZrIvgdDwrs98pAf/h5rAKLsh7ySjEKBYbzQ/fZoH7bikHjt\"},\"s3\":{\"s3SchemaVersion\":\"1.0\",\"configurationId\":\"tf-s3-queue-20200320230455199200000001\",\"bucket\":{\"name\":\"tidal-bken-dev\",\"ownerIdentity\":{\"principalId\":\"A3DM7NBP99T08P\"},\"arn\":\"arn:aws:s3:::tidal-bken-dev\"},\"object\":{\"key\":\"uploads/test/source.mp4\",\"size\":18446809,\"eTag\":\"cb1c4a864d063b7b4bb96460c13e1392-2\",\"sequencer\":\"005E754C8E4B399B4B\"}}}]}" } ] }'
MESSAGES=$(echo $TEST | jq -r '.Messages')

for MESSAGE in $(echo $MESSAGES | jq -r '.[] | @base64'); do
  RECEIPT_HANDLE=$(echo $MESSAGE | base64 --decode | jq -r ${1} | jq '.ReceiptHandle')
  echo $RECEIPT_HANDLE
  RECORDS=$(echo $MESSAGE | base64 --decode | jq -r ${1} | jq -r '.Body')
  echo $RECORDS

  for RECORD in $(echo $RECORDS | jq -r '.Records' | jq -r '.[] | @base64'); do
    echo $RECORD
    EVENT=$(echo $RECORD | base64 --decode | jq -r ${1} | jq -r '.')
    echo $EVENT

    KEY=$(echo $EVENT | jq -r '.s3.object.key')
    BUCKET=$(echo $EVENT | jq -r '.s3.bucket.name')

    VIDEO_ID=$(echo $KEY | cut -d/ -f2)
    FILENAME=$(echo $KEY | cut -d/ -f3)

    echo "KEY $KEY"
    echo "BUCKET $BUCKET"
    echo "VIDEO_ID $VIDEO_ID"
    echo "FILENAME $FILENAME"


  done

  # aws sqs delete-message \
  #   --region us-east-1 \
  #   --queue-url $UPLOAD_QUEUE_URL \
  #   --receipt-handle $RECEIPT_HANDLE

  echo "Done"
done
