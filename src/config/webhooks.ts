import { WebhookJobData } from '../types'
import { defaultConnection } from './redis'
import { webhookJob } from '../jobs/webhook'
import { Job, Queue, QueueScheduler, Worker } from 'bullmq'

// Increasing the lock duration attempts to avoid stalling jobs
const lockDuration = 1000 * 240 // 4 minutes

export const webhookQueue = {
  queue: new Queue('webhooks', {
    connection: defaultConnection,
    defaultJobOptions: {
      attempts: 2,
      backoff: { delay: 1000, type: 'exponential' },
    },
  }),
  worker: new Worker('webhooks', webhookJob, {
    concurrency: 1,
    lockDuration: lockDuration,
    connection: defaultConnection,
    lockRenewTime: lockDuration / 4,
    limiter: { max: 1, duration: 1000 },
  }),
  scheduler: new QueueScheduler('webhooks', { connection: defaultConnection }),
}

export async function enqueueWebhook(job: Job) {
  const webhookBody: WebhookJobData = {
    id: job.id,
    name: job.name,
    data: job.data,
    queueName: job.name,
    progress: job.progress,
    returnValue: job.returnvalue,
    isFailed: await job.isFailed(),
  }
  webhookQueue.queue.add('dispatch', webhookBody)
}
