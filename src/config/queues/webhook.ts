import { Queue, Worker, QueueScheduler, Job } from 'bullmq'
import { dispatchWebhook } from '../../jobs/dispatchWebhook'
import { TidalWebhookBody } from '../../types'

function queueSwitch(job: Job) {
  switch (job.name) {
    case 'dispatch':
      return dispatchWebhook(job)
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
  connection: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      delay: 1000,
      type: 'exponential',
    },
  },
})

export const webhookQueueScheduler = new QueueScheduler(webhookQueue.name, {
  connection: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
})

export const webhookWorker = new Worker(webhookQueue.name, async job => queueSwitch(job), {
  concurrency: 10,
  limiter: {
    max: 30,
    duration: 1000,
  },
  connection: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
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
