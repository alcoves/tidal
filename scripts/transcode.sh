#!/bin/bash
set -e

VIDEO_PATH="local/$(ls local/)"
echo "Video Path $VIDEO_PATH"

ffmpeg -i $VIDEO_PATH -c:v libx264 -crf 22 local/out.mp4 

aws s3 cp local/out.mp4 s3://bken-sandbox-dev/720p-converted.mp4