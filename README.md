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