#!/bin/bash
set -e

ls local/

ffmpeg -i local/video.mp4 -c:v libx264 -crf 22 local/out.mp4 

aws s3 cp local/out.mp4 s3://bken-sandbox-dev/720p-converted.mp4