nomad job dispatch -detach \
  -meta "video_id=test" \
  -meta "filename=source.mp4" \
  -meta "bucket=tidal-bken-dev" \
  -meta "transcode_queue_url=https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-dev" \
  segmenting
