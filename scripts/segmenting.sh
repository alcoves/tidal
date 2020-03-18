#!/bin/bash
set -e

echo "Setting envs"
BUCKET=$1
VIDEO_ID=$2
FILENAME=$3
AWS_ACCESS_KEY_ID=$4
GITHUB_ACCESS_TOKEN=$5
AWS_SECRET_ACCESS_KEY=$6

TMP_DIR=$(mktemp -d)
SEGMENTS_DIR="$TMP_DIR/segments"
AUDIO_PATH="$TMP_DIR/source.wav"
SOURCE_VIDEO="$TMP_DIR/$FILENAME"

echo "Creating rclone config"
mkdir -p /root/.config/rclone
cat > /root/.config/rclone/rclone.conf <<EOL
[do]
type = s3
provider = DigitalOcean
env_auth = false
access_key_id = $AWS_ACCESS_KEY_ID
secret_access_key = $AWS_SECRET_ACCESS_KEY
endpoint = nyc3.digitaloceanspaces.com
acl = private
EOL

echo "Downloading source clip"
cd
rclone copy do:$BUCKET/uploads/$VIDEO_ID/$FILENAME/ $TMP_DIR

echo "Create data directories"
mkdir -p $SEGMENTS_DIR

echo "Exporting audio"
ffmpeg -i $SOURCE_VIDEO -threads 1 $AUDIO_PATH

echo "Uploading audio"
rclone copy $AUDIO_PATH do:$BUCKET/audio/$VIDEO_ID/source.wav

echo "Segmenting video"
ffmpeg -i $SOURCE_VIDEO -y -map 0 -threads 1 -c copy -f segment -segment_time 10 -an $SEGMENTS_DIR/output_%04d.mkv

echo "Segmentation complete"
ls $SEGMENTS_DIR/

echo "Getting video metadata"
METADATA=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 $SOURCE_VIDEO)
ARR=(${METADATA//,/ })
WIDTH=${ARR[0]}
HEIGHT=${ARR[1]}

echo "Video Width: $WIDTH"
echo "Video Height: $HEIGHT"

echo "Uploading segments"
rclone sync $SEGMENT_DIR do:$BUCKET/segments/$VIDEO_ID/

for PRESET in "480p-libx264" "720p-libx264"; do
  for SEGMENT in $(ls $SEGMENTS_DIR); do
    echo "Enqueuing transcoding requests"
    nomad job dispatch -detach \
      -meta "cmd=-c:v libx264 -crf 22 -preset slow" \
      -meta "preset=$PRESET" \
      -meta "bucket=$BUCKET" \
      -meta "segment=$SEGMENT" \
      -meta "video_id=$VIDEO_ID" \
      -meta "aws_access_key_id=$AWS_ACCESS_KEY_ID" \
      -meta "github_access_token=$GITHUB_ACCESS_TOKEN" \
      -meta "aws_secret_access_key=$AWS_SECRET_ACCESS_KEY" \
      transcoding
  done

  echo "Enqueuing concatination requests"
  nomad job dispatch -detach \
      -meta "preset=$PRESET" \
      -meta "bucket=$BUCKET" \
      -meta "video_id=$VIDEO_ID" \
      -meta "aws_access_key_id=$AWS_ACCESS_KEY_ID" \
      -meta "github_access_token=$GITHUB_ACCESS_TOKEN" \
      -meta "aws_secret_access_key=$AWS_SECRET_ACCESS_KEY" \
    concatinating
done
