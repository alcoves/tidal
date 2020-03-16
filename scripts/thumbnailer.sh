#!/bin/bash
set -e
ls
ls -al

ls ./local/

FILE_NAME=local/720p.mp4
THUMB_NAME=local/thumb.webp

# wget -O $FILE_NAME $1
ffmpeg -i $FILE_NAME -vframes 1 -ss $2 -filter:v scale='480:-1' -quality 70 $THUMB_NAME
aws s3 cp $THUMB_NAME s3://bken-tidal-dev/test/$THUMB_NAME