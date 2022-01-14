# Tidal Overview

### Running Locally

. ./.env && docker-compose up

### ENV

```sh
DEFAULT_BUCKET="my-bucket"
S3_ENDPOINT=https://my.s3.endpoint
S3_ACCESS_KEY_ID=access_key
S3_SECRET_ACCESS_KEY=secret_access_key

WEBHOOK_URL="http://the-delivery-address-to-recieve-post-requests"

AUTH_KEY="" # Requests must include the header "X-API-Key" which should contain the value of AUTH_KEY. This is our basic authentication method.
BUNNY_ACCESS_KEY=""
```

# Redis

Tidal uses Redis and bullmq to process jobs.

<!-- Since encoding is a very CPU intensive task, you can run in API only mode (job processing will be skipped) by setting the env `WORKER_NODE` to `false` -->

### Development

I'm not accepting pull requests right now. Tidal is still just an experimental idea.

### Brief History

In 2019, I set off on a journey to build a chunked-based distributed video transcoder. TLDR: Chunk-based transcoders are stupidly fast and stupidly complex.

Everything becomes more complicated as the traditional single-node video processing pipeline is broken apart and distributed. Early versions of Tidal ran on AWS Lambda and AWS EC2 spot instances. These versions we're incredibly fast at the expense of brittle behavior and high fiscal cost. The AWS Lambda version, for example, could transcode a full-length feature film at multiple bitrates in under 5 minutes.

It's easy to see the benefits of a chunk-based approach. Netflix and Bitmovin have good reasons to pursue chunk-based or scene-based transcoding. Though, under the surface probably lies a heap of complexity that we don't see. For those who deal with processing heaps of video, it's incredible to see the process become _network_ limited as opposed to computing power limited. I found that stitching segments back together and packaging content for delivery took longer than transcoding each chunk (assuming an adequately sized infrastructure).

I eventually gave up on the idea of an open-source chunk-based transcoder because of the ballooning complexity. Every link in the chain needed error handling, retries, rate limiting, health checking, etc... Maybe one day, but for now, bken.io needs a simple transcoder. It doesn't need to be _that_ fast.
