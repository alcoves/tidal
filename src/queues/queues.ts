import { webhookJob } from '../jobs/webhook'
import { queueFactory } from './queueFactory'
import { metadataJob } from '../jobs/metadata'
import { thumbnailJob } from '../jobs/thumbnail'
import { adaptiveTranscodeJob } from '../jobs/adaptiveTranscode'

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
  webhooksDisabled: false,
  lockDuration: 1000 * 240,
  jobHandler: webhookJob,
})
