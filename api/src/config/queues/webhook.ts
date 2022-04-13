import { defaultConnection } from '../redis'
import { TidalWebhookBody } from '../../types'
import { Queue, Worker, QueueScheduler, Job } from 'bullmq'
import { webhooks } from '../../jobs/webhooks'

// Increasing the lock duration attempts to avoid stalling jobs
const lockDuration = 1000 * 240 // 4 minutes

function queueSwitch(job: Job) {
  switch (job.name) {
    case 'dispatch':
      return webhooks(job)
    default:
      console.error(`Job ${job.name} not found in ${job.queueName} queue`)
  }
}

export async function enqueueWebhook(job: Job) {
  const webhookBody: TidalWebhookBody = {
    id: job.id,
    name: job.name,
    data: job.data,
    queueName: job.name,
    progress: job.progress,
    returnValue: job.returnvalue,
    isFailed: await job.isFailed(),
  }
  await webhookQueue.add('dispatch', webhookBody)
}

export const webhookQueue = new Queue('webhook', {
  connection: defaultConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      delay: 1000,
      type: 'exponential',
    },
  },
})

export const webhookQueueScheduler = new QueueScheduler(webhookQueue.name, {
  connection: defaultConnection,
})

export const webhookWorker = new Worker(webhookQueue.name, async job => queueSwitch(job), {
  concurrency: 10,
  limiter: {
    max: 30,
    duration: 1000,
  },
  lockDuration: lockDuration,
  lockRenewTime: lockDuration / 4,
  connection: defaultConnection,
})

webhookWorker.on('completed', job => {
  console.log(`${job.queueName} :: ${job.id} has completed!`)
})

webhookWorker.on('failed', (job, err) => {
  console.log(`${job.queueName} :: ${job.id} has failed with ${err.message}`)
})

webhookWorker.on('progress', job => {
  console.log(`${job.queueName} :: ${job.id} has progress of ${job.progress}`)
})
