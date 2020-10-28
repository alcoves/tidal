ffmpeg -y -i source.mp4 \
  -f hls \
  -hls_time 10 \
  -sc_threshold 0 \
  -g 48 -keyint_min 48 \
  -hls_playlist_type vod \
  -hls_segment_filename source_%d.ts \
  source.m3u8