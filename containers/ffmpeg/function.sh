#!/bin/bash

set -euo pipefail

CMD=$CMD
INPUT_URI=$INPUT_URI
OUTPUT_URI=$OUTPUT_URI
AWS_S3_ENDPOINT=$AWS_S3_ENDPOINT
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY

echo "start"
echo $@

TMP_INPUT_DIR=$(mktemp -d)
TMP_INPUT_FILENAME=$(basename $INPUT_URI)
TMP_INPUT_FILEPATH="${TMP_INPUT_DIR}/${TMP_INPUT_FILENAME}"

TMP_OUTPUT_DIR=$(mktemp -d)
TMP_OUTPUT_FILENAME=$(basename $OUTPUT_URI)
TMP_OUTPUT_FILEPATH="${TMP_OUTPUT_DIR}/${TMP_OUTPUT_FILENAME}"

echo "downloading source file"
aws s3 cp $INPUT_URI $TMP_INPUT_FILEPATH --endpoint $AWS_S3_ENDPOINT

echo "transcoding source file"
ffmpeg -y -i $TMP_INPUT_FILEPATH $CMD $TMP_OUTPUT_FILEPATH

echo "uploading transcoded file"
aws s3 mv $TMP_OUTPUT_FILEPATH $OUTPUT_URI --endpoint $AWS_S3_ENDPOINT

echo "deleting temporary directory"
rm -rf $TMP_INPUT_DIR
rm -rf $TMP_OUTPUT_DIR

echo "done"
exit 0
