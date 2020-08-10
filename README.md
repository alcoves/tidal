# Modules

## Segmenter

This module splits a video into chunks and uploads them to s3. When chunks are uploaded, a lambda fires off that will handle enqueueing source segments or updating tidal-db from transcoded segments

```bash
S3_IN="s3://tidal-bken-dev/uploads/test/source.mp4"
S3_OUT="s3://tidal-bken-dev/segments/test/source"
FFMPEG_COMMAND="-an -c:v copy -f segment -segment_time 10"

./segment.sh $S3_IN $S3_OUT "$FFMPEG_COMMAND"
```

## Transcoder

This module transcodes segments with the given ffmpeg command, completed segments are uploaded to s3. When segments land in s3, a separate lambda is fired which updates the database.

```bash
S3_IN="s3://tidal-bken-dev/uploads/test/source.mp4"
S3_OUT="s3://tidal-bken-dev/segments/test/source"
FFMPEG_COMMAND="-an -c:v copy -f segment -segment_time 10"

./segmenting.sh $S3_IN $S3_OUT "$FFMPEG_COMMAND"
```

nomad job dispatch -detach -meta s3_in="s3://tidal-bken-dev/uploads/test/source.mp4" -meta s3_out="s3://tidal-bken-dev/transcoded/test/libx264-720p.mp4" -meta cmd="-c:v libx264 -an -crf 40 -vf scale=720:-2" transcoding

## Dispatching

nomad job dispatch \
  -meta s3_in=s3://tidal-bken/source/test/source.mp4 \
  -meta script_path=/home/brendan/code/bken/tidal/src/uploading.js \
  uploading

nomad job dispatch \
  -meta script_path=/home/brendan/code/bken/tidal/src/segmenting.js \
  -meta s3_in=s3://tidal-bken/source/test/source.mp4 \
  -meta s3_out=s3://tidal-bken/segments/test/source \
  -meta cmd='-an -c:v copy -f segment -segment_time 10' \
  segmenting