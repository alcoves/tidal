# Setup

### Nomad

Tidal is designed to run within a nomad cluster. You can use some of our patterns from the `infrastucture/` directory, or run the jobs in your own cluster. bken.io hosts the terraform that manages our own infrastructure in a separate repository.

1. Setup a nomad cluster with at least 1 server and 1 client
2. On each server, make sure nomad is installed
3. On the server, run `provisioning.sh server`
4. On the client, run `provisioning.sh client $SERVER_PRIVATE_IP`

Provishioning should install the dependencies needed to run the jobs. Right now Tidal runs with the `raw_exec` driver, as such, the nomad client itself needs these dependencies. While we may move to docker in the future, this is how it currently works.

### Consul

The consul key/value store is used to store and retreive credentials needed to access tidal resources (database and object storage buckets).

You must enter the following keys into your k/v store

tidal/ (directory)
tidal/pg_connection_string
tidal/do_access_key_id
tidal/do_secret_access_key
tidal/wasabi_access_key_id
tidal/wasabi_secret_access_key_id

### Database

Tidal is designed to write data to a postgresql database. Enter the connection string in consul and tidal will handle writing information to that database. To provision the table, check out `db/schema.sql`

# Modules

## Uploader

This module

- accepts 

## Segmenter

This module

- downloads a source file (s3_in)
- splits the video into 10 second chunks
- uploads the chunks (s3_out)
- updates the database

contraints:

- the video must have moov atoms, otherwise it cannot be segmented
- must be in a format that can be contained by matroska

```bash
tidal segment \
  --s3_in="s3://tidal/uploads/test/source.mp4" \
  --s3_out="s3://tidal/uploads/test/source.mp4" \
  --ffmpeg_command="-an -c:v copy -f segment -segment_time 10"
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

nomad job dispatch \
  -meta script_path=/home/brendan/code/bken/tidal/src/audio.js \
  -meta s3_in=s3://tidal-bken/source/test/source.mp4 \
  -meta s3_out=s3://tidal-bken/audio/test/libx264-720p/source.aac \
  -meta cmd='-vn -c:a aac' \
  audio

nomad job dispatch \
  -meta s3_in=s3://tidal-bken/segments/test/libx264-720p \
  -meta s3_out=s3://cdn.bken.io/v/test/libx264-720p.mp4 \
  -meta script_path=/home/brendan/code/bken/tidal/scripts/concatinating.sh \
  concatinating

nomad job dispatch \
  -meta s3_in=s3://tidal/sources/test/source.mp4 \
  -meta script_path=/root/tidal/scripts/thumbnail.sh \
  -meta s3_out=s3://cdn.bken.io/i/test/thumbnail.webp \
  -meta cmd='-vf scale=854:480:force_original_aspect_ratio=increase,crop=854:480 -vframes 1 -q:v 50' \
  thumbnail

## POC

```sh
#!/bin/bash
set -e

echo "Cleaning up workspace"
rm -rf ./tmp/segments && rm -rf ./tmp/transcoded && rm -f ./tmp/concat-manifest.txt
mkdir ./tmp/segments && mkdir ./tmp/transcoded

echo "Create test video"
# ffmpeg -y -f lavfi -i sine=frequency=1000:sample_rate=48000:duration=60 -f lavfi -i testsrc=duration=60:size=1280x720:rate=60 test.mp4

echo "Segmenting video"
ffmpeg -y -i ./tmp/test.mp4 -c:v copy -f segment -segment_time 1 -an ./tmp/segments/%06d.mkv

echo "Transcoding segments"
for PART in $(ls ./tmp/segments); do
  ffmpeg -y -i ./tmp/segments/$PART -c:v libvpx-vp9 -speed 5 -deadline realtime -b:v 0 -crf 30 -vf scale=832:-2 ./tmp/transcoded/$PART;
  echo "file './transcoded/$PART'" >> ./tmp/concat-manifest.txt;
done

echo "Concatinating transcoded segments"
# Create concated video
ffmpeg -y -f concat -safe 0 -i ./tmp/concat-manifest.txt -c:v copy ./tmp/converted.mkv;

# Pull audio from source
# Dont assume the audio is aac
ffmpeg -y -i ./tmp/test.mp4 ./tmp/test.wav

# Combine converted video with original audio track
ffmpeg -y -i ./tmp/converted.mkv -i ./tmp/test.wav -c:v copy -f webm - | ffmpeg -y -i - -c copy ./tmp/converted-with-audio.webm

echo "Exporting audio for spectro analysis"
ffmpeg -y -i ./tmp/test.mp4 ./tmp/test.wav
ffmpeg -y -i ./tmp/converted-with-audio.webm ./tmp/converted.wav

echo "Creating spectrograms"
sox ./tmp/test.wav -n spectrogram -Y 400 -c "Input file" -o ./tmp/test.png
sox ./tmp/converted.wav -n spectrogram -Y 400 -c "Concat file" -o ./tmp/converted.png

SOURCE_VIDEO_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ./tmp/test.mp4)
CONVERTED_VIDEO_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ./tmp/converted.mkv)
CONVERTED_VIDEO_WITH_AUDIO_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ./tmp/converted-with-audio.webm)

echo "Source Duration: $SOURCE_VIDEO_DURATION"
echo "Converted Duration: $CONVERTED_VIDEO_DURATION"
echo "Converted Video With Audio Duration: $CONVERTED_VIDEO_DURATION"
```