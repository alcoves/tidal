#!/bin/bash
set -e

PWD=$(pwd)
DIR="$PWD/tmp"
INPUT_URL="https://s3.us-east-2.wasabisys.com/cdn.bken.io/tests/1080p-30fps-long/source.mp4"

rm -rf $DIR && mkdir -p $DIR

ffmpeg -i $INPUT_URL \
  -map 0:v:0 -map 0:a\?:0 -map 0:v:0 -map 0:a\?:0 -map 0:v:0 -map 0:a\?:0 -map 0:v:0 -map 0:a\?:0 \
  -crf 30 -c:v:0 libx264 -filter:v:0 "scale=320:-1,fps=fps=15" \
  -crf 27 -c:v:1 libx264 -filter:v:1 "scale=640:-1,fps=fps=30" \
  -crf 25 -c:v:2 libx264 -filter:v:2 "scale=1280:-1" \
  -crf 23 -c:v:3 libx264 -filter:v:3 "scale=1920:-1" \
  -use_timeline 1 -use_template 1 -adaptation_sets "id=0,streams=v id=1,streams=a" \
  -hls_playlist false -f dash $DIR/output.mpd

aws s3 sync $DIR s3://cdn.bken.io/tests/tmp --profile wasabi --endpoint="https://us-east-2.wasabisys.com"