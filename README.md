# Overview

Tidal is a video transcoding engine that aims to simplify multi-node video coding. Tidal scales horizontally and vertically to meet the demands of your workloads. Video codecs are only getting more intensive. Tidal aims to simply the complex task of distributed video coding.

I'm not accepting pull requests right now. Tidal is changing rapidly.

## Architecture

Tidal relies heavily on Redis and bullmq to orchestrate jobs. We recommend using a container orchestrator like swarm, nomad, or k8s to scale out. As long as your containers connect to redis, they will start processing jobs.

We highly recommend running the API server on a different node than the workers. Worker nodes will regularly hit 100% CPU usage which will degrade the responsiveness of the API. To run an API only server, simply set `DISABLE_JOBS=true`

We recommend using minio for s3 compatible storage. We only support object storage at this moment. Beware the cost of egress bandiwdth if your nodes are outside of your cloud provider.

## Local development

.env

```
REDIS_PORT="6379"
REDIS_HOST="localhost"
REDIS_PASSWORD="redis"

DISABLE_JOBS="false"
API_KEY="tidal"
DISABLE_WEBHOOKS="false"
WEBHOOK_URL="http://localhost:4000/webhooks/tidal"

TIDAL_BUCKET="tidal"
AWS_ACCESS_KEY_ID="minioadmin"
AWS_SECRET_ACCESS_KEY="minioadmin"
AWS_ENDPONT="http://localhost:9001"
```

- Create the `.env` file as described above
- Run redis database `cd docs && docker-compose -p "tidal" up -d`
- Run `yarn && yarn dev`
- The API will run on `http://localhost:5000` and the UI on `http://localhost:1234/ui` with hot reloading enabled
  - In a deployed environment, the UI is built and hosted statically at `http://localhost:5000/ui`
- Now use the UI to add enter the required configuration on the via the Settings tab
  - The default API key is `tidal` if one is not provided

## Techniques

Tidal will support creating dyamic `workflows`. A workflow is a series of steps that take an input file all the way to the desired end state. An example would be `given this input file...transcode resolutions 720p, 1080p, and 1440p...then package to the HLS format`. Another workflow might be `given this input file...segment into 10 second chunks...transcode each chunk to x265...recombine...publish to s3`

---

### Assumptions

- All file inputs are expected to be URLs
