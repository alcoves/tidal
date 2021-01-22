# Tidal

Tidal is a distributed chunk based video transcoder that can run on any mix of hardware.

### Requirements

- A Nomad cluster with about 3gb of memory per worker node
- Consul and Nomad clients must be installed side by side, consul is used for secrets management
- Linux servers with [these dependencies](https://github.com/bken-io/keel)
- An s3 object store (more to come on how to configure this)

### Database

Early on, I realzied having a seperate database to manage tidal state was a bit of a pain. I might add a database in the future but right now s3 is the database. You can query the state of a video and look for metadata by using simple s3 queries. More to come on how to make these queries.

### Architecture
##### Ingest

This stage splits a video into segments. The video file must contain a valid x264 stream. Right now only .mp4 and .mov files that contain x264 streams are supported right now. I understand that greater codec fleability is a huge want, but at this time it's just easier to support a single codec.

During ingest, presets are created. An example of a preset would be 360p or 1080p. When presets are generated, they contain an ffmpeg command that should be used to create the desired preset.

Individual source segments and source audio are uploaded to tidals internal s3 object store. At the end of ingest, we invoke the preset in a nested for loop that logically says for each segment and for each preset, enqueue a transcoding job.

If you have 30 source segments and 5 presets, 150 transcoding jobs will be enqueued.

##### Transcode

Transcoding jobs take a source segment uri, a destination uri, and an ffmpeg command. The transcoder runs the ffmpeg command on the source segments and uploads it to the destination.

The transcode jobs also have the responsability of enqueuing the packaging job. When the total number of encoded segments is equal to the total number of source segments, the transcoder invocation will aquire a dsitributed lock on the video preset id. This lock prevents other transcode jobs from equeuing duplicate packaging jobs. Because s3 is eventually consistent, we need this lock to ensure that we only enqueue one packaging job.

When the packaging job is enqueued, the lock is removed and other jobs would technically be able to enqueue another packaging job.

##### Packaging

Packaging jobs enqueued by the transcoding jobs.

The packager downloads all transcoded segments and performs a lot of muxing in order to get to the HLS format.

The packaging pipeline is in flux as I find more ways to safetly mux everything. I wish I could just create HLS manifests directly from the transcoded segments without having to mux them together, but this has proven very difficult to do without video stuttering and side effects.

When the HLS packaging is done, all segments and manifest files are uploaded to the Wasabi CDN.

The packaging job also creates the master.m3u8 playlist file by downloading all .m3u8 playlist files and combining them together. This process could be suseptable to weird async eventually consistent errors, but I have not experienced any so far.

### MVP

check out docs/mvp.sh for the lite version of what tidal does.

### CLI

#### Create a thumbnail

```
# Create a default thumbnail from the start of the video
tidal thumbnail \
  s3://cdn.bken.io/source.mp4 \
  s3://cdn.bken.io/i/id/thumb.webp \
  --profile wasabi

# Create a thumbnail at 31.5 seconds
tidal thumbnail \
  s3://cdn.bken.io/source.mp4 \
  s3://cdn.bken.io/i/id/thumb.webp \
  --profile wasabi \
  --duration 31.5

# Create a jpeg thumbnail
tidal thumbnail \
  s3://cdn.bken.io/source.mp4 \
  s3://cdn.bken.io/i/id/thumb.jpg \
  --profile wasabi

# Override the ffmpeg command
tidal thumbnail \
  s3://cdn.bken.io/source.mp4 \
  s3://cdn.bken.io/i/id/thumb.webp \
  --profile wasabi \
  --cmd "-vf scale=854:480:force_original_aspect_ratio=increase,crop=854:480 -vframes 1 -q:v 80"
```

Default thumbnail transformation
`-vf scale=854:480:force_original_aspect_ratio=increase,crop=854:480 -vframes 1 -q:v 50`

#### Ingest video

tidal ingest s3://cdn.bken.io/v/id/source.mp4
