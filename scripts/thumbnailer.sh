#!/bin/bash
set -e

TMP_DIR=$(mktemp -d)

wget -O "${TMP_DIR}/source.mp4" $1

ffmpeg -i "${TMP_DIR}/source.mp4" -vframes 1 -ss $2 -filter:v scale='720:-1' "${TMP_DIR}/thumb.jpg"

aws s3 cp "${TMP_DIR}/thumb.jpg" s3://bken-tidal-dev/test/thumb.jpg