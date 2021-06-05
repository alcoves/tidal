# Tidal

Tidal is a chunk-based video transcoding pipeline that utilizes Hashicorp Nomad and Consul to horizontally scale across hundreds of nodes.

### Local Development

Start Nomad and Consul

```
nomad agent -dev
consul agent -dev
yarn dev
```

#### Config Files

Tidal uses consul kv to store configuration parameters that control how tidal operates.

Required Keys

```
config/tidal_dir # The directory that tidal uses to process videos (this should be an NFS mount availible on each node)
config/rclone # The rclone config that tidal will use to ingress and egress video data
config/nomad_acl_token # Required when acl is enabled
config/consul_acl_token # Required when acl is enabled
```

```
rm -rf tmp && mkdir -p tmp/360p && \
ffmpeg -y -i "https://s3.us-east-2.wasabisys.com/cdn.bken.io/tests/1440p-60fps-small/source.mp4" \
  -vf scale=w=640:h=360:force_original_aspect_ratio=decrease -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod  -b:v 800k -maxrate 856k -bufsize 1200k -b:a 96k -hls_segment_filename tmp/360p/%d.ts tmp/360p/index.m3u8 \
  -vf scale=w=842:h=480:force_original_aspect_ratio=decrease -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod -b:v 1400k -maxrate 1498k -bufsize 2100k -b:a 128k -hls_segment_filename tmp/480p_%03d.ts tmp/480p.m3u8 \
  -vf scale=w=1280:h=720:force_original_aspect_ratio=decrease -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod -b:v 2800k -maxrate 2996k -bufsize 4200k -b:a 128k -hls_segment_filename tmp/720p_%03d.ts tmp/720p.m3u8 \
  -vf scale=w=1920:h=1080:force_original_aspect_ratio=decrease -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod -b:v 5000k -maxrate 5350k -bufsize 7500k -b:a 192k -hls_segment_filename tmp/1080p_%03d.ts tmp/1080p.m3u8 \
  -hls_master_name tmp/master.m3u8

```

```sh
echo ACCESS_KEY_ID:SECRET_ACCESS_KEY > ${HOME}/.passwd-s3fs
chmod 600 ${HOME}/.passwd-s3fs
s3fs mybucket /path/to/mountpoint -o passwd_file=${HOME}/.passwd-s3fs

rm -rf tmp && mkdir -p tmp

ffmpeg -y -i "https://s3.us-east-2.wasabisys.com/cdn.bken.io/tests/1440p-60fps-small/source.mp4" \
 -vf scale=w=640:h=360:force_original_aspect_ratio=decrease,fps=fps=15 -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod -b:v 800k -maxrate 856k -bufsize 1200k -b:a 96k -hls_segment_filename tmp/360p_%06d.ts -master_pl_name 360p_master.m3u8 tmp/360p.m3u8 \
 -vf scale=w=842:h=480:force_original_aspect_ratio=decrease,fps=fps=15 -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod -b:v 1400k -maxrate 1498k -bufsize 2100k -b:a 128k -hls_segment_filename tmp/480p_%03d.ts -master_pl_name 480_master.m3u8 tmp/480p.m3u8

echo "#EXTM3U" > ./tmp/master.m3u8
echo "#EXT-X-VERSION:3" >> ./tmp/master.m3u8

for f in ./tmp/*_master.m3u8; do
  echo "Processing: $f"
  echo $(sed '3q;d' ./tmp/master.m3u8) >> ./tmp/master.m3u8
  echo $(sed '4q;d' ./tmp/master.m3u8) >> ./tmp/master.m3u8
done

aws s3 sync ./tmp s3://cdn.bken.io/tests/tmp --profile wasabi --endpoint="https://us-east-2.wasabisys.com"
```

```bash
go build main.go && ./main api --port=4000

VIDEO_ID="zhZspVW7im_2rcQvbrQLg"
go build main.go && ./main transcode \
  --videoId="$VIDEO_ID" \
  --webhookUrl="https://bken.io/api/videos/${VIDEO_ID}" \
  --rcloneDestinationUri="wasabi:cdn.bken.io/v/${VIDEO_ID}" \
  --rcloneSourceUri="wasabi:cdn.bken.io/v/${VIDEO_ID}/${VIDEO_ID}.mp4"

VIDEO_ID="zhZspVW7im_2rcQvbrQLg"
nomad job dispatch -detach \
  -meta=video_id="$VIDEO_ID" \
  -meta=webhook_url="https://bken.io/api/videos/${VIDEO_ID}" \
  -meta=rclone_destination_uri="wasabi:cdn.bken.io/v/${VIDEO_ID}" \
  -meta=rclone_source_uri="wasabi:cdn.bken.io/v/${VIDEO_ID}/${VIDEO_ID}.mp4" \
  transcode
```
