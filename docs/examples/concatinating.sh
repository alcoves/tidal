nomad job dispatch -detach \
  -meta "preset=720p-libx264" \
  -meta "bucket=bken-tidal-dev" \
  -meta "video_id=id1" \
  concatinating

nomad job dispatch -detach \
  -meta "video_id=test" \
  -meta "filename=source.mp4" \
  -meta "bucket=tidal-bken-dev" \
  -meta "transcode_queue_url=https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-dev" \
  concatinating
