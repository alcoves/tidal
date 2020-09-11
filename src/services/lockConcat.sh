#!/bin/bash
set -e

if [ ! -z "$(consul kv get $LOCK_KEY)" ]; then
  echo "dispatching concatination job"
  nomad job dispatch \
    -detach \
    -meta s3_in="$CONCAT_S3_IN" \
    -meta s3_out="$CONCAT_S3_OUT" \
    concatinating
  consul kv delete $LOCK_KEY
else
  echo "aquired concatiantion lock, but had already been handled"
fi
