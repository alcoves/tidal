import { webhookJob } from '../jobs/webhook'
import { queueFactory } from './queueFactory'
import { metadataJob } from '../jobs/metadata'
import { thumbnailJob } from '../jobs/thumbnail'
import { videoHandler } from '../handlers/video'
import { adaptiveTranscodeJob } from '../jobs/adaptiveTranscode'

const queueNames = ['adaptiveTranscode', 'metadata', 'thumbnail', 'webhooks', 'video']

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

export const video = queueFactory({
  queueName: queueNames[4],
  concurrency: 4,
  workerDisabled: false,
  webhooksDisabled: false,
  lockDuration: 1000 * 240,
  jobHandler: videoHandler,
})
