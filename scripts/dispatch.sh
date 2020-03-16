#!/bin/bash
set -e

# Ensure we have at least an input file
if [ $# -eq 0 ]; then
  echo "Usage: dispatch.sh <input file>"
  exit 1
fi

# Send a video to get transcoded
nomad job dispatch -detach -meta "profile=small" -meta "input=$1" transcode