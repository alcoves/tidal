## FFMpeg

This is a simple container that contains ffmpeg and the aws cli. It is meant to be input/output oriented and provide a very basic way to run ffmpeg commands inside a docker container

### Building

docker build . -t ffmpeg:local

### Running

docker run \
 -e CMD="-c:v libx264 -crf 30" \
 -e INPUT_URI="s3://bucket/inputs/bing-bong.mp4" \
 -e OUTPUT_URI="s3://bucket/outputs/bing-bong.mp4" \
 -e AWS_S3_ENDPOINT="123" \
 -e AWS_ACCESS_KEY_ID="123" \
 -e AWS_SECRET_ACCESS_KEY="123" \
 ffmpeg:local
