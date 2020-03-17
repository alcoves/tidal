#!/bin/bash
set -e

# Env
IN_PATH= "local/file"
OUT_DIR = "local/segments"

# Creating data directories
mkdir -p $OUT_DIR

# Segmenting video
ffmpeg -y -i $IN_PATH -y -map 0 -c copy -f segment -segment_time 10 -an $OUT_DIR/output_%04d.mp4

ls $OUT_DIR/