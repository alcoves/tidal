# Tidal

Tidal is a distributed video transcoder. The current implementation runs on AWS Lamabda and EC2. MP4 videos are segmentated and uploaded to s3. Then, lambda performs fan out transcoding for each segment. The resulting transcoded segments are stitched back together which creates the final video.

Tidal is under heavy development. The API will change drastically.

## Benchmarks

TODO

## How to Run

- Clone the repo, yarn at the root to install deps
- Make sure the aws-cli and ffmpeg are installed on your machine
- Create a custom lambda with ffmpeg and bash (follow this guide)
- Create an sqs queue
- export AWS_PROFILE=myCoolTestAccount

You are ready to process some videos! Keep in mind that tidal is network intensive!

### Full pipeline

`node src/index.js --bucket=bken-dve-dev --s3Dir=t2 --sourceFileName=test.mp4`

### Run tidal one step at a time

You can run the three distinct steps one at a time, useful for debugging.

#### Segment video

`node src/segment.js --bucket=bken-dve-dev --segmentSourcePath=t2/source.mp4 --segmentDestinationPath=t2/transcoded`

#### Transcode video

`node src/segment.js --bucket=bken-dve-dev --sourcePath=t2/segments --uploadPath=t2/transcoded/ --format=auto`

#### Concat video

`node src/concat.js --bucket=bken-dve-dev --concatSourcePath=t2/transcoded --concatDestinationPath=t2/transcoded.mp4`
