#!/bin/bash
set -e

UPLOAD_QUEUE_URL=$1
TRANSCODE_QUEUE_URL=$2

echo "$UPLOAD_QUEUE_URL"
echo "$TRANSCODE_QUEUE_URL"

QUEUE_POLL_RESPONSE=$(aws sqs receive-message --max-number-of-messages 1 --region us-east-1 --output json --queue-url $UPLOAD_QUEUE_URL)
echo $QUEUE_POLL_RESPONSE

MESSAGES=$(echo $QUEUE_POLL_RESPONSE | jq -r '.Messages')
echo $MESSAGES

# TEST='{"Messages":[{"ReceiptHandle":"AQEBiWvuErNwPKQARXjZ0/4W9tJusvXNkdaU6OMDAcEwxkMYBGRn542T7QcGcpMel4OILSeA1Tda0jcjFvViNbf6C85d2KAC5lyrfIesQ9Hc5CSQCP58ue/Fm6vlk1qvpOgh6IsP0Ds3uWnNCKzLq13BVn4bcnI6xMCqElBo4W8xWDKHozbZLxAKi42TJzDumCoDXF5gc8CFCz1ztpm81fRzm2Sv7qvzPt3DWou96NxEcwuxYBna417swUwb2fQpWfWXi2my0zEHALit3E2y5YeqNUkStCNOdmc3WZpv55922eUdYTSo1MT784QsVx6rtJpHd1RUiVUv9uBt3R/kTUeSuOfnzgXA2RMSvbPfZbwcwc5NDM6Zb1H1H4OXxssAKg8NSFUpdqtIkp65W0pVOYxbXA==","Body":"{\"Records\":[{\"eventVersion\":\"2.1\",\"eventSource\":\"aws:s3\",\"awsRegion\":\"us-east-1\",\"eventTime\":\"2020-03-20T23:06:54.834Z\",\"eventName\":\"ObjectCreated:CompleteMultipartUpload\",\"userIdentity\":{\"principalId\":\"A3DM7NBP99T08P\"},\"requestParameters\":{\"sourceIPAddress\":\"162.225.189.133\"},\"responseElements\":{\"x-amz-request-id\":\"E58D7A6ACC99B7DC\",\"x-amz-id-2\":\"yjncmgW7zsBVM0wk/OwFF6ZrwZF1QbMFmLYVK1W+77OwltN0LZrIvgdDwrs98pAf/h5rAKLsh7ySjEKBYbzQ/fZoH7bikHjt\"},\"s3\":{\"s3SchemaVersion\":\"1.0\",\"configurationId\":\"tf-s3-queue-20200320230455199200000001\",\"bucket\":{\"name\":\"tidal-bken-dev\",\"ownerIdentity\":{\"principalId\":\"A3DM7NBP99T08P\"},\"arn\":\"arn:aws:s3:::tidal-bken-dev\"},\"object\":{\"key\":\"uploads/test/source.mp4\",\"size\":18446809,\"eTag\":\"cb1c4a864d063b7b4bb96460c13e1392-2\",\"sequencer\":\"005E754C8E4B399B4B\"}}},{\"eventVersion\":\"2.1\",\"eventSource\":\"aws:s3\",\"awsRegion\":\"us-east-1\",\"eventTime\":\"2020-03-20T23:06:54.834Z\",\"eventName\":\"ObjectCreated:CompleteMultipartUpload\",\"userIdentity\":{\"principalId\":\"A3DM7NBP99T08P\"},\"requestParameters\":{\"sourceIPAddress\":\"162.225.189.133\"},\"responseElements\":{\"x-amz-request-id\":\"E58D7A6ACC99B7DC\",\"x-amz-id-2\":\"yjncmgW7zsBVM0wk/OwFF6ZrwZF1QbMFmLYVK1W+77OwltN0LZrIvgdDwrs98pAf/h5rAKLsh7ySjEKBYbzQ/fZoH7bikHjt\"},\"s3\":{\"s3SchemaVersion\":\"1.0\",\"configurationId\":\"tf-s3-queue-20200320230455199200000001\",\"bucket\":{\"name\":\"tidal-bken-dev\",\"ownerIdentity\":{\"principalId\":\"A3DM7NBP99T08P\"},\"arn\":\"arn:aws:s3:::tidal-bken-dev\"},\"object\":{\"key\":\"uploads/test/source.mp4\",\"size\":18446809,\"eTag\":\"cb1c4a864d063b7b4bb96460c13e1392-2\",\"sequencer\":\"005E754C8E4B399B4B\"}}}]}","MD5OfBody":"fc2740d9059cbb03488d628d842549e6","MessageId":"ecb7701b-a39a-49c4-98a5-7736aae464ed"},{"ReceiptHandle":"AQEBiWvuErNwPKQARXjZ0/4W9tJusvXNkdaU6OMDAcEwxkMYBGRn542T7QcGcpMel4OILSeA1Tda0jcjFvViNbf6C85d2KAC5lyrfIesQ9Hc5CSQCP58ue/Fm6vlk1qvpOgh6IsP0Ds3uWnNCKzLq13BVn4bcnI6xMCqElBo4W8xWDKHozbZLxAKi42TJzDumCoDXF5gc8CFCz1ztpm81fRzm2Sv7qvzPt3DWou96NxEcwuxYBna417swUwb2fQpWfWXi2my0zEHALit3E2y5YeqNUkStCNOdmc3WZpv55922eUdYTSo1MT784QsVx6rtJpHd1RUiVUv9uBt3R/kTUeSuOfnzgXA2RMSvbPfZbwcwc5NDM6Zb1H1H4OXxssAKg8NSFUpdqtIkp65W0pVOYxbXA==","Body":"{\"Records\":[{\"eventVersion\":\"2.1\",\"eventSource\":\"aws:s3\",\"awsRegion\":\"us-east-1\",\"eventTime\":\"2020-03-20T23:06:54.834Z\",\"eventName\":\"ObjectCreated:CompleteMultipartUpload\",\"userIdentity\":{\"principalId\":\"A3DM7NBP99T08P\"},\"requestParameters\":{\"sourceIPAddress\":\"162.225.189.133\"},\"responseElements\":{\"x-amz-request-id\":\"E58D7A6ACC99B7DC\",\"x-amz-id-2\":\"yjncmgW7zsBVM0wk/OwFF6ZrwZF1QbMFmLYVK1W+77OwltN0LZrIvgdDwrs98pAf/h5rAKLsh7ySjEKBYbzQ/fZoH7bikHjt\"},\"s3\":{\"s3SchemaVersion\":\"1.0\",\"configurationId\":\"tf-s3-queue-20200320230455199200000001\",\"bucket\":{\"name\":\"tidal-bken-dev\",\"ownerIdentity\":{\"principalId\":\"A3DM7NBP99T08P\"},\"arn\":\"arn:aws:s3:::tidal-bken-dev\"},\"object\":{\"key\":\"uploads/test/source.mp4\",\"size\":18446809,\"eTag\":\"cb1c4a864d063b7b4bb96460c13e1392-2\",\"sequencer\":\"005E754C8E4B399B4B\"}}},{\"eventVersion\":\"2.1\",\"eventSource\":\"aws:s3\",\"awsRegion\":\"us-east-1\",\"eventTime\":\"2020-03-20T23:06:54.834Z\",\"eventName\":\"ObjectCreated:CompleteMultipartUpload\",\"userIdentity\":{\"principalId\":\"A3DM7NBP99T08P\"},\"requestParameters\":{\"sourceIPAddress\":\"162.225.189.133\"},\"responseElements\":{\"x-amz-request-id\":\"E58D7A6ACC99B7DC\",\"x-amz-id-2\":\"yjncmgW7zsBVM0wk/OwFF6ZrwZF1QbMFmLYVK1W+77OwltN0LZrIvgdDwrs98pAf/h5rAKLsh7ySjEKBYbzQ/fZoH7bikHjt\"},\"s3\":{\"s3SchemaVersion\":\"1.0\",\"configurationId\":\"tf-s3-queue-20200320230455199200000001\",\"bucket\":{\"name\":\"tidal-bken-dev\",\"ownerIdentity\":{\"principalId\":\"A3DM7NBP99T08P\"},\"arn\":\"arn:aws:s3:::tidal-bken-dev\"},\"object\":{\"key\":\"uploads/test/source.mp4\",\"size\":18446809,\"eTag\":\"cb1c4a864d063b7b4bb96460c13e1392-2\",\"sequencer\":\"005E754C8E4B399B4B\"}}}]}","MD5OfBody":"fc2740d9059cbb03488d628d842549e6","MessageId":"ecb7701b-a39a-49c4-98a5-7736aae464ed"}]}'
# MESSAGES=$(echo $TEST | jq -r '.Messages')

for MESSAGE in $(echo $MESSAGES | jq -r '.[] | @base64'); do
  RECEIPT_HANDLE=$(echo $MESSAGE | base64 --decode | jq -r ${1} | jq '.ReceiptHandle')
  RECORDS=$(echo $MESSAGE | base64 --decode | jq -r ${1} | jq -r '.Body')

  for RECORD in $(echo $RECORDS | jq -r '.Records' | jq -r '.[] | @base64'); do
    EVENT=$(echo $RECORD | base64 --decode | jq -r ${1} | jq -r '.')

    KEY=$(echo $EVENT | jq -r '.s3.object.key')
    BUCKET=$(echo $EVENT | jq -r '.s3.bucket.name')

    VIDEO_ID=$(echo $KEY | cut -d/ -f2)
    FILENAME=$(echo $KEY | cut -d/ -f3)

    echo "KEY $KEY"
    echo "BUCKET $BUCKET"
    echo "VIDEO_ID $VIDEO_ID"
    echo "FILENAME $FILENAME"

    nomad job dispatch -detach \
      -meta "video_id=$VIDEO_ID" \
      -meta "filename=$FILENAME" \
      -meta "bucket=$BUCKET" \
      -meta "transcode_queue_url=$TRANSCODE_QUEUE_URL" \
      segmenting

    # nomad job dispatch -detach \
    #   -meta "video_id=test" \
    #   -meta "filename=source.mp4" \
    #   -meta "bucket=tidal-bken-dev" \
    #   -meta "transcode_queue_url=https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-dev" \
    #   concatinating
  done

  echo "$RECEIPT_HANDLE"

  aws sqs delete-message \
    --region us-east-1 \
    --queue-url $UPLOAD_QUEUE_URL \
    --receipt-handle $RECEIPT_HANDLE

  echo "Done"
done
