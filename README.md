# Tidal

Tidal is a media encoding API with ajoining pipeline and CLI functionalist. Tidal accepts requests over it's API and uses Consul, Nomad, and the Tidal CLI to perform batched video transcodes.

### Overview

Tidal is composed of an API and CLI that are packaged together. Tidal is written in Go and largely just wraps ffmpeg and rclone commands. While the earliest versions of tidal was just bash scripts, I found that bash was not the right tool for things like error handling, event notifications (webhooks), and preset generation to name a few.

In production, Tidal uses Nomad and Consul to create a simple architecture that contains the following resources

Infrastructure:

- 1-3 master servers for Consul and Nomad
- 1-2 worker servers for the Tidal API and the Tidal CLI

Nomad:

- Fabio job for load balancing
- Nomad job for running the Tidal API
- Nomad batch jobs for scalable workload scheduling

Consul:

- Consul KV for secrets storage

In a clustered setup, the request flow would look something like this.

```
User transcode request (POST /jobs/transcode) -> Fabio -> Tidal API -> Nomad Dispatch -> Return 202
Nomad Dispatch -> Nomad Schedules `tidal transcode...` -> Transcode runs and webhooks current status back to configured endpoint
```

### Development

I'm not accepting pull requests right now. Tidal is still just an experimental idea.

### Brief History

In 2019, I set off on a journey to build a chunked-based distributed video transcoder. TLDR: Chunk-based transcoders are stupidly fast and stupidly complex.

Everything becomes more complicated as the traditional single-node video processing pipeline is broken apart and distributed. Early versions of Tidal ran on AWS Lambda and AWS EC2 spot instances. These versions we're incredibly fast at the expense of brittle behavior and high fiscal cost. The AWS Lambda version, for example, could transcode a full-length feature film at multiple bitrates in under 5 minutes.

It's easy to see the benefits of a chunk-based approach. Netflix and Bitmovin have good reasons to pursue chunk-based or scene-based transcoding. Though, under the surface probably lies a heap of complexity that we don't see. For those who deal with processing heaps of video, it's incredible to see the process become _network_ limited as opposed to computing power limited. I found that stitching segments back together and packaging content for delivery took longer than transcoding each chunk (assuming an adequately sized infrastructure).

I eventually gave up on the idea of an open-source chunk-based transcoder because of the ballooning complexity. Every link in the chain needed error handling, retries, rate limiting, health checking, etc... Maybe one day, but for now, bken.io needs a simple transcoder. It doesn't need to be _that_ fast.
