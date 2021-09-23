# Tidal Overview

### API

GET / - healthcheck

#### Assets

POST /assets - creates a video entry
GET /assets/:assetId - returns an asset
DELETE /assets/:assedId - deletes an asset
GET /assets/:assetId.m3u8 - returns a .m3u8 file

#### Chunks

PUT /chunks - an internal only endpoint that Tidal uses to publish video chunks, Must be called by localhost

Notes:

- When a video is created, renditions are written to the database. These renditions contain the ffmpeg command necessary to encode the content.
- The m3u8 playlists will only return renditions that are completed. So you must wait for at least 1 encoding to be completed before the video will be playable

### Development

I'm not accepting pull requests right now. Tidal is still just an experimental idea.

### Deployment

Tidal's API servers should run seperate from the encoding nodes. To enable a node for encoding work, set the environment variable TIDAL_ENCODE to "true".

### Brief History

In 2019, I set off on a journey to build a chunked-based distributed video transcoder. TLDR: Chunk-based transcoders are stupidly fast and stupidly complex.

Everything becomes more complicated as the traditional single-node video processing pipeline is broken apart and distributed. Early versions of Tidal ran on AWS Lambda and AWS EC2 spot instances. These versions we're incredibly fast at the expense of brittle behavior and high fiscal cost. The AWS Lambda version, for example, could transcode a full-length feature film at multiple bitrates in under 5 minutes.

It's easy to see the benefits of a chunk-based approach. Netflix and Bitmovin have good reasons to pursue chunk-based or scene-based transcoding. Though, under the surface probably lies a heap of complexity that we don't see. For those who deal with processing heaps of video, it's incredible to see the process become _network_ limited as opposed to computing power limited. I found that stitching segments back together and packaging content for delivery took longer than transcoding each chunk (assuming an adequately sized infrastructure).

I eventually gave up on the idea of an open-source chunk-based transcoder because of the ballooning complexity. Every link in the chain needed error handling, retries, rate limiting, health checking, etc... Maybe one day, but for now, bken.io needs a simple transcoder. It doesn't need to be _that_ fast.
