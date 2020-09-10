#!/bin/bash
set -e

LOCK_KEY=$1
S3_IN=$2
S3_OUT=$3

echo "S3_IN: $S3_IN"
echo "S3_OUT: $S3_OUT"
echo "LOCK_KEY: $LOCK_KEY"

echo "checking status"
LOCK_KEY_EXISTS=$(consul kv get $LOCK_KEY)
echo "LOCK_KEY_EXISTS: $LOCK_KEY_EXISTS"

if [ -z "$LOCK_KEY_EXISTS" ]; then
  echo "dispatching concatination job"
  nomad job dispatch \
    -detach \
    -meta s3_in="$S3_IN" \
    -meta s3_out="$S3_OUT" \
    concatinating
  consul kv delete $LOCK_KEY
else
  echo "aquired concatiantion lock, but had already been handled"
fi
