#!/bin/bash

TMP_DIR=$(mktemp -d)

ffmpeg -i $1 -vframes 1 -ss $2 -filter:v scale="720:-1" "$TMP_DIR/thumb.jpg"

# TODO :: send event notification
