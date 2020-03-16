#!/bin/bash
set -e

TMP_DIR=$(mktemp -d)

wget -O "${TMP_DIR}/source.mp4" $1

ffmpeg "${TMP_DIR}/source.mp4" -c copy "${TMP_DIR}/outFile.mp4"