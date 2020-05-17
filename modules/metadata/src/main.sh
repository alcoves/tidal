function handler () {
  set -e
  IN_PATH="$(echo $1 | jq -r '.in_path')"

  echo "creating signed url"
  URL=$(aws s3 presign $IN_PATH)

  echo "querying for metadata"
  METADATA=$(/opt/ffmpeg/ffprobe \
  -v quiet \
  -print_format json \
  -show_format \
  -show_streams \
  "$URL")

  echo "returning metdata"
  echo $METADATA >&2
}
