#!/bin/bash
set -e

VIDEO_INPUT_PATH=local/file
VIDEO_OUTPUT_PATH=local/out.mp4

ffmpeg -y -i $VIDEO_INPUT_PATH -c:v libx264 -crf 22 -preset fast $VIDEO_OUTPUT_PATH

aws s3 cp $VIDEO_OUTPUT_PATH s3://bken-sandbox-dev/720p-converted.mp4