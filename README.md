# Tidal

Tidal is a distributed video transcoder. The current implementation runs on AWS Lamabda and ECS Fargate. MP4 videos are segmentated and uploaded to s3. Then, lambda performs fan out transcoding for each segment. The resulting transcoded segments are stitched back together which creates the final video.

Tidal is under heavy development. The API will change drastically.

## Pipeline

### Step 1: Segmentation

- Splits up a video into smaller segments
- Splits the audio from the source clip

Local example:

```bash
tidal segment test.mp4 .
```

S3 example:

- If transcodeQueueUrl is passed, the transcode events are published to sqs

```bash
tidal segment s3://bucket/sources/id/test.mp4 s3://bucket/segments/id \
  --transcodeQueueUrl=""

# This yeilds an s3 directory that looks like...
# s3://bucket/segments/id/source/output_0000.mkv
# s3://bucket/segments/id/source/output_0001.mkv
# s3://bucket/segments/id/source.wav
```

### Step 2: Transcoding

- Transcode each part

Local example:

```bash
tidal transcode ./segments ./transcoded --presets libx264_1080p
```

Deployed example:

pass the `--transcodeQueueUrl` flag to the segment command. Transcode events will be sent to the queue specified by the `--transcodeQueueUrl` flag from the segmentation process. Use any compute you like to pull items from the queue to process. The event shape is as follows.

```json
{
  "IN": "s3://bucket/segments/id/source/output_0000.mkv",
  "FFMPEG_ARGS": "-c:v libx264 -crf 20",
  "OUT": "s3://bucket/segments/id/libx264_1080p/output_0000.mkv"
}
```

It's tough to determine when the process is complete. Right now I recommend running a daemon that crawls s3 looking for items to stich back together.

### Step 3: Concatination

- For each preset, download the transcoded segments
- Combine to final video
- Combine with source audio
- Upload to CDN

Local example:

```bash
tidal concat ./transcoded/libx264_1080p finished.mp4
```

Deployed example:

```bash
tidal concat s3://bucket/segments/id/libx264_1080p s3://bucket/transcoded/id/libx264_1080p.mp4
```

## Benchmarks

TODO

## Experiments

- EFS (slow and expensive, reverted back to s3)
- EC2 (faster but difficult to manage, slower to boot than fargate)
- Nodejs (initial cli was in node, rapid development, poor results and maintainability)
- Rust (ongoing rewrite: very safe, slower to develop, i'm bad at it)
- DigitalOcean (best dev experience hands down, hard to justify building everything)
- Linode (fastest network I have ever used, 40gbit...100gbit...)
- av1 (way too slow in ffmpeg, rav1e may be the way to go)
- Formats (need to conduct extensive format testing to see what video types work/don't work)
- Audio (source audio is used, no logic to compress as of now, transcoder should handle compression)

## Examples

```sh
cargo run -- segment \
  s3://tidal-bken-dev/uploads/3HM4Ka2OS/source.mp4 \
  s3://tidal-bken-dev/segments/3HM4Ka2OS \
  --transcode_queue_url="https://sqs.us-east-1.amazonaws.com/594206825329/tidal-transcoding-dev"
```
