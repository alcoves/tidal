import { webhookJob } from '../jobs/webhook'
import { queueFactory } from './queueFactory'
import { metadataJob } from '../jobs/metadata'
import { thumbnailJob } from '../jobs/thumbnail'
import { videoHandler } from '../handlers/video'
import { ingestionHandler } from '../handlers/ingestion'
import { adaptiveTranscodeJob } from '../jobs/adaptiveTranscode'
import { onCompleted, onFailed, onProgress } from './workerEvents'

const queueNames = ['adaptiveTranscode', 'metadata', 'thumbnail', 'webhooks']

export const adaptiveTranscode = queueFactory({
  queueName: queueNames[0],
  concurrency: 4,
  workerDisabled: false,
  webhooksDisabled: false,
  lockDuration: 1000 * 240,
  jobHandler: adaptiveTranscodeJob,
})

export const metadata = queueFactory({
  queueName: queueNames[1],
  concurrency: 4,
  workerDisabled: false,
  webhooksDisabled: false,
  lockDuration: 1000 * 240,
  jobHandler: metadataJob,
})

export const thumbnail = queueFactory({
  queueName: queueNames[2],
  concurrency: 4,
  workerDisabled: false,
  webhooksDisabled: false,
  lockDuration: 1000 * 240,
  jobHandler: thumbnailJob,
})

export const webhooks = queueFactory({
  queueName: queueNames[3],
  concurrency: 4,
  workerDisabled: false,
  webhooksDisabled: true, // Disabled so webhook jobs don't re-emit webhooks
  lockDuration: 1000 * 240,
  jobHandler: webhookJob,
})

const queues = {
  // adaptiveTranscode: queueFactory({
  //   queueName: 'adaptiveTranscode',
  //   concurrency: 4,
  //   workerDisabled: false,
  //   webhooksDisabled: false,
  //   lockDuration: 1000 * 240,
  //   jobHandler: adaptiveTranscodeJob,
  // }),
  // thumbnail: queueFactory({
  //   queueName: 'thumbnail',
  //   concurrency: 4,
  //   workerDisabled: false,
  //   webhooksDisabled: false,
  //   lockDuration: 1000 * 240,
  //   jobHandler: thumbnailJob,
  // }),
  // metadata: queueFactory({
  //   queueName: 'metadata',
  //   concurrency: 4,
  //   workerDisabled: false,
  //   webhooksDisabled: false,
  //   lockDuration: 1000 * 240,
  //   jobHandler: metadataJob,
  // }),
  ingestion: queueFactory({
    queueName: 'ingestion',
    concurrency: 4,
    workerDisabled: false,
    webhooksDisabled: false,
    lockDuration: 1000 * 240,
    jobHandler: ingestionHandler,
    // workerOnFailed: onFailed, // This is the extra functionality on top of webhooks
    // workerOnProgress: onProgress,
    // workerOnCompleted: onCompleted,
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
