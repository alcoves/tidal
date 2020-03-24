# Tidal

Tidal is a distributed video transcoder. The current implementation runs on AWS Lamabda and EC2. MP4 videos are segmentated and uploaded to s3. Then, lambda performs fan out transcoding for each segment. The resulting transcoded segments are stitched back together which creates the final video.

Tidal is under heavy development. The API will change drastically.

## Pipeline

### Step 1: Segmentation

1. Files are uploaded to the `tidal-dev-bken` bucket under `/source/${videoId}/source.mp4`
2. The act of uploading a file here triggers the `tidal-dev-seg-launcher`. This lambda boots an ec2 with the proper amount of disk space to segment the file. The segmenter accepts the s3 path as an input and segments the file. Then, a manifest file is created which contains the list of formats that will be generated. The segmenter uploads segments to `/segments/${videoId}/segments/output-0000.mkv` and the manifest file to `/segments/${videoId}/manifest.json`. **The last segment has an amazon s3 custom metadata tag `lastSeg=true`. This is used by subsequent systems and is very imortant!**

### Step 2: Transcoding

1. When segments are written to the segments folder, this emits events. The act of placing a single segment emits 1 event, however, we read the manifest.json file and write 1 to many events into an sqs queue for transcoding. so each segment has multiple versions that need to be transcoded. The manifest file must exist or the enqueuing of the files will fail. Events are written to `tidal-dev-transcoding-requests`. This queue invokes the `tidal-dev-transcoder` which takes an s3 path and an ffmpeg command stream to run.
2. The transcoded outputs files to `/segments/${videoId}/${presetName}/output-0000.mkv`, the lastSegment header must be passed to the segments, this tells the system when to wait for segments to become availible. 
3. The 

### Step 3: Concatination

1. When a transcoded preset is finished, the `tidal-dev-concatination` lambda is fired. This lambda concatinates the transcoded segment files, muxes the audio in (re-encoding if needed) and saves the resulting file to `/transcoded/${videoId}/${presetName}.mp4`

### Step 4: Publishing

1. When a preset video is placed in `/transcoded/${videoId}/${presetName}.mp4`, that action emits an event which is handled by the `tidal-dev-transcode-egress` lambda. This lambda copies the object to the wasabi bucket and emits an event to sns indicating that the video file is ready to be viewed.

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

`{"bucket":"bken-dve-dev","sourceUrl":"https://s3.us-east-2.wasabisys.com/media-bken/tests/test.mp4","videoId":"t2","eventPublishingArn":"arn:aws:sns:us-east-1:594206825329:bken-dev-tidal-events","encodingQueueUrl":"https://sqs.us-east-1.amazonaws.com/594206825329/dev-transcoding"}`

### Full pipeline

`node src/index.js --bucket=bken-dve-dev --videoId=t2 --sourceKey=tests/test.mp4 --sourceBucket=media-bken --encodingQueueUrl=https://sqs.us-east-1.amazonaws.com/594206825329/dev-transcoding --eventPublishingArn=arn:aws:sns:us-east-1:594206825329:bken-dev-tidal-events`
