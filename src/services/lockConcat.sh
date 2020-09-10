#!/bin/bash
set -eux

echo "checking status"
LOCK_KEY_EXISTS=$(consul kv get $LOCK_KEY)
echo "LOCK_KEY_EXISTS: $LOCK_KEY_EXISTS"

if [ -z "$LOCK_KEY_EXISTS" ]; then
  echo "dispatching concatination job"
  nomad job dispatch \
    -detach \
    -meta s3_in="$S3_IN" \
    -meta s3_out="$CDN_PATH" \
    concatinating
  consul kv delete $LOCK_KEY
else
  echo "aquired concatiantion lock, but had already been handled"
fi
