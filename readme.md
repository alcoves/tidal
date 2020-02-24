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

### Listening Mode

This runs the server perpetually. Messages are long polled from SQS. One processing operation is allowed at a time.

`node src/listen.js --sqsQueueArn="test"`

Make sure your SQS messages look like the following

`{"bucket":"bken-dve-dev","sourceFileName":"test.mp4","videoId":"t2"}`

### Full pipeline

`node src/index.js --bucket=bken-dve-dev --videoId=t2 --sourceFileName=test.mp4 --encodingQueueUrl=https://sqs.us-east-1.amazonaws.com/594206825329/dev-transcoding --eventPublishingArn=arn:aws:sns:us-east-1:594206825329:bken-dev-tidal-events`
