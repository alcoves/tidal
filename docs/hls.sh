
rm -rf data/hls/*.ts
rm -rf data/hls/*.m3u8
rm -rf data/hls/segments
mkdir -p data/hls/segments
aws s3 rm s3://bken/hls2/ --profile digitalocean --endpoint=https://nyc3.digitaloceanspaces.com --recursive


ffmpeg -y -i data/source.mp4 \
  -c copy \
  -f mpegts \
  - | ffmpeg -y -i - \
  -f hls \
  -c:v copy \
  -hls_time 2 \
  -sc_threshold 0 \
  -g 60 -keyint_min 60 \
  -hls_playlist_type vod \
  -hls_segment_filename data/hls/segments/source_%d.ts \
  data/hls/source.m3u8

for SEGMENT_NAME in $(ls data/hls/segments/); do
  ffmpeg -y -i data/hls/segments/$SEGMENT_NAME -c copy data/hls/$SEGMENT_NAME
  mv data/hls/$SEGMENT_NAME data/hls/segments/$SEGMENT_NAME
  echo "$SEGMENT_NAME"
done;

mv data/hls/segments/*.ts data/hls/

echo "#EXTM3U" >> data/hls/playlist.m3u8
echo "#EXT-X-VERSION:5" >> data/hls/playlist.m3u8
echo "#EXT-X-STREAM-INF:BANDWIDTH=8210010,RESOLUTION=1280x720" >> data/hls/playlist.m3u8
echo "source.m3u8" >> data/hls/playlist.m3u8

aws s3 sync data/hls/ s3://bken/hls2/ --profile digitalocean --endpoint=https://nyc3.digitaloceanspaces.com --acl public-read