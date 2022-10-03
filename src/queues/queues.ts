import { webhookJob } from '../handlers/webhook'
import { queueFactory } from './queueFactory'
import { metadataJob } from '../handlers/metadata'
import { thumbnailJob } from '../handlers/thumbnail'
import { transcodeJob } from '../handlers/transcode'
import { ingestionHandler } from '../handlers/ingestion'

const queues = {
  transcodes: queueFactory({
    queueName: 'transcode',
    concurrency: 4,
    workerDisabled: false,
    webhooksDisabled: false,
    lockDuration: 1000 * 240,
    jobHandler: transcodeJob,
  }),
  thumbnail: queueFactory({
    queueName: 'thumbnail',
    concurrency: 4,
    workerDisabled: false,
    webhooksDisabled: false,
    lockDuration: 1000 * 240,
    jobHandler: thumbnailJob,
  }),
  metadata: queueFactory({
    queueName: 'metadata',
    concurrency: 4,
    workerDisabled: false,
    webhooksDisabled: false,
    lockDuration: 1000 * 240,
    jobHandler: metadataJob,
  }),
  ingestion: queueFactory({
    queueName: 'ingestion',
    concurrency: 4,
    workerDisabled: false,
    webhooksDisabled: false,
    lockDuration: 1000 * 240,
    jobHandler: ingestionHandler,
  }),
  webhooks: queueFactory({
    queueName: 'webhooks',
    concurrency: 4,
    workerDisabled: false,
    webhooksDisabled: true,
    lockDuration: 1000 * 240,
    jobHandler: webhookJob,
  }),
}

export default queues
