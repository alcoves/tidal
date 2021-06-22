### Standalone Examples

- Your local ffmpeg and ffprobe binaries will be used
- Your local rclone.conf file will be used
- Only S3 Rclone remotes have been tested

```bash
# Transcode a video file and upload the MPEG Dash results to an rclone destination
VIDEO_ID="zhZspVW7im_2rcQvbrQLg"
go build main.go && ./main transcode \
  --videoId="$VIDEO_ID" \
  --webhookUrl="https://bken.io/api/videos/${VIDEO_ID}" \
  --rcloneDestinationUri="wasabi:cdn.bken.io/v/${VIDEO_ID}/pkg" \
  --rcloneSourceUri="wasabi:cdn.bken.io/v/${VIDEO_ID}/${VIDEO_ID}.mp4"

# In a clustered environment, it is better to dispatch a job so that Nomad can schedule it
VIDEO_ID="zhZspVW7im_2rcQvbrQLg"
nomad job dispatch -detach \
  -meta=video_id="$VIDEO_ID" \
  -meta=webhook_url="https://bken.io/api/videos/${VIDEO_ID}" \
  -meta=rclone_destination_uri="wasabi:cdn.bken.io/v/${VIDEO_ID}" \
  -meta=rclone_source_uri="wasabi:cdn.bken.io/v/${VIDEO_ID}/${VIDEO_ID}.mp4" \
  transcode

# Generate thumbnail
# The rcloneDestinationUri must contain a file extention supported by ffmpeg
VIDEO_ID="zhZspVW7im_2rcQvbrQLg"
go build main.go && ./main thumbnail \
  --videoId="$VIDEO_ID" \
  --webhookUrl="https://bken.io/api/videos/${VIDEO_ID}" \
  --rcloneDestinationUri="wasabi:cdn.bken.io/v/${VIDEO_ID}/thumb.webp" \
  --rcloneSourceUri="wasabi:cdn.bken.io/v/${VIDEO_ID}/${VIDEO_ID}.mp4"
```
