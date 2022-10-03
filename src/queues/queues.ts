import { webhookJob } from '../handlers/webhook'
import { queueFactory } from './queueFactory'
import { metadataJob } from '../handlers/metadata'
import { thumbnailJob } from '../handlers/thumbnail'
import { ingestionHandler } from '../handlers/ingestion'
import { adaptiveTranscodeJob } from '../handlers/adaptiveTranscode'
// import { onCompleted, onFailed, onProgress } from './workerEvents'

const queues = {
  adaptiveTranscode: queueFactory({
    queueName: 'adaptiveTranscode',
    concurrency: 4,
    workerDisabled: false,
    webhooksDisabled: false,
    lockDuration: 1000 * 240,
    jobHandler: adaptiveTranscodeJob,
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
