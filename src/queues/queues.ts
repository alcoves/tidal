import { queueFactory } from './queueFactory'
// import { webhookJob } from '../handlers/webhook'
// import { metadataJob } from '../handlers/metadata'
import { thumbnailJob } from '../handlers/thumbnail'
import { transcodeJob } from '../handlers/transcode'
import { ingestionHandler } from '../handlers/ingestion'
import { thumbnail, transcode, ingestion } from './workerEvents'

const queues = {
  ingestion: queueFactory({
    queueName: 'ingestion',
    concurrency: 4,
    workerDisabled: false,
    lockDuration: 1000 * 240,
    jobHandler: ingestionHandler,
    onFailed: ingestion.onFailed,
    onProgress: ingestion.onProgress,
    onCompleted: ingestion.onCompleted,
  }),
  thumbnail: queueFactory({
    queueName: 'thumbnail',
    concurrency: 4,
    workerDisabled: false,
    lockDuration: 1000 * 240,
    jobHandler: thumbnailJob,
    onFailed: thumbnail.onFailed,
    onProgress: thumbnail.onProgress,
    onCompleted: thumbnail.onCompleted,
  }),
  transcodes: queueFactory({
    queueName: 'transcode',
    concurrency: 4,
    workerDisabled: false,
    lockDuration: 1000 * 240,
    jobHandler: transcodeJob,
    onFailed: transcode.onFailed,
    onProgress: transcode.onProgress,
    onCompleted: transcode.onCompleted,
  }),
  // webhooks: queueFactory({
  //   queueName: 'webhooks',
  //   concurrency: 4,
  //   workerDisabled: false,
  //   lockDuration: 1000 * 240,
  //   jobHandler: webhookJob,
  // }),
}

export default queues
