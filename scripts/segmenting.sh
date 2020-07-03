#!/bin/bash
set -e

S3_IN=$1
S3_OUT=$2
FFMPEG_COMMAND=$3

echo "S3_IN: ${S3_IN}"
echo "S3_OUT: ${S3_OUT}"
echo "FFMPEG_COMMAND: ${FFMPEG_COMMAND}"

echo "creating signed source url"
SIGNED_SOURCE_URL=$(aws s3 presign $S3_IN)

VIDEO_EXTENSION="${S3_IN##*.}"
echo "VIDEO_EXTENSION: ${VIDEO_EXTENSION}"

# if [ "$VIDEO_EXTENSION" = "webm" ] || [ "$VIDEO_EXTENSION" = "mkv" ]; then
#   SEGMENTATION_EXT="mkv"
# else 
#   SEGMENTATION_EXT="mp4"
# fi

echo "parsing variables"
VIDEO_ID="$(echo $S3_OUT | cut -d'/' -f5)"  
PRESET_NAME="$(echo $S3_OUT | cut -d'/' -f6)"
SEGMENT_NAME="$(echo $S3_OUT | cut -d'/' -f7)"

BUCKET="$(echo $IN_PATH | cut -d'/' -f3)"
echo "BUCKET: ${BUCKET}"

TIDAL_ENV="$(echo $BUCKET | cut -d'-' -f3)"
echo "TIDAL_ENV: ${TIDAL_ENV}"

echo "VIDEO_ID: ${VIDEO_ID}"
echo "PRESET_NAME: ${PRESET_NAME}"
echo "SEGMENT_NAME: ${SEGMENT_NAME}"

echo "creating tmp directory"
TMP_SEGMENT_DIR=$(mktemp -d)

echo "segmentation started"
ffmpeg -y -i "$SIGNED_SOURCE_URL" $FFMPEG_COMMAND $TMP_SEGMENT_DIR/%08d.$VIDEO_EXTENSION

echo "tally segments"
SEGMENT_COUNT=$(ls -1q $TMP_SEGMENT_DIR | wc -l)

echo "moving segments to s3"
aws s3 sync $TMP_SEGMENT_DIR $S3_OUT

echo "removing tmp segment dir"
rm -rf $TMP_SEGMENT_DIR

echo "updating tidal db"
ITEMS=$(aws dynamodb query \
  --table-name "tidal-${TIDAL_ENV}" \
  --key-condition-expression "id = :id" \
  --expression-attribute-values "{\":id\":{\"S\":\"$VIDEO_ID\"}}" \
  | jq -r '.Items')

for row in $(echo "${ITEMS}" | jq -r '.[] | @base64'); do
  _jq() {
    echo ${row} | base64 --decode | jq -r ${1}
  }
  
  PRESET=$(_jq '.preset.S')
  
  aws dynamodb update-item \
    --table-name "tidal-${TIDAL_ENV}" \
    --key "{\"id\":{\"S\":\"$VIDEO_ID\"},\"preset\":{\"S\":\"$PRESET\"}}" \
    --update-expression "SET segmentCount = :segmentCount" \
    --expression-attribute-values "{\":segmentCount\":{\"N\":\"$SEGMENT_COUNT\"}}"
done

echo "segmentation completed"