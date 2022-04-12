# Tidal Overview

### Running Locally

.env

```
REDIS_PORT=6379
REDIS_HOST=localhost
REDIS_PASSWORD=test

--- Optional

API_PORT=5001
API_URL=http://localhost:5001
DISABLE_JOBS=true
CONCURRENT_JOBS=1
```

- Create the `.env` file as described above
- Run redis database `docker compose up -d`
- Run `yarn && yarn dev`
- The API will run on `http://localhost:5000` and the UI on `http://localhost:1234/ui` with hot reloading enabled
  - In a deployed environment, the UI is built and hosted statically at `http://localhost:5000/ui`
- Create a record in Redis like this `SET tidal:settings '{"apiKey":"test"}'`
- Now use the UI to add enter the required configuration on the via the Settings tab

# Redis

Tidal uses Redis and bullmq to process jobs.

<!-- Since encoding is a very CPU intensive task, you can run in API only mode (job processing will be skipped) by setting the env `DISABLE_JOBS` to any value -->

### Development

I'm not accepting pull requests right now. Tidal is still just an experimental idea.

### Brief History

In 2019, I set off on a journey to build a chunked-based distributed video transcoder. TLDR: Chunk-based transcoders are stupidly fast and stupidly complex.

Everything becomes more complicated as the traditional single-node video processing pipeline is broken apart and distributed. Early versions of Tidal ran on AWS Lambda and AWS EC2 spot instances. These versions we're incredibly fast at the expense of brittle behavior and high fiscal cost. The AWS Lambda version, for example, could transcode a full-length feature film at multiple bitrates in under 5 minutes.

It's easy to see the benefits of a chunk-based approach. Netflix and Bitmovin have good reasons to pursue chunk-based or scene-based transcoding. Though, under the surface probably lies a heap of complexity that we don't see. For those who deal with processing heaps of video, it's incredible to see the process become _network_ limited as opposed to computing power limited. I found that stitching segments back together and packaging content for delivery took longer than transcoding each chunk (assuming an adequately sized infrastructure).

I eventually gave up on the idea of an open-source chunk-based transcoder because of the ballooning complexity. Every link in the chain needed error handling, retries, rate limiting, health checking, etc... Maybe one day, but for now, bken.io needs a simple transcoder. It doesn't need to be _that_ fast.
