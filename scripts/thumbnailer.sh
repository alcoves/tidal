#!/bin/bash
set -e

ffmpeg -i $1 -vframes 1 -ss $2 -filter:v scale='720:-1' -f mp4 -movflags frag_keyframe+faststart pipe:1 | aws s3 cp - s3://bken-tidal-dev/test/thumb.jpg