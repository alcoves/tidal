import { enqueueWebhook, webhookQueue } from './webhook'
import { getMetadataJob } from '../../jobs/getMetadata'
import { Queue, Worker, QueueScheduler, Job } from 'bullmq'

function queueSwitch(job: Job) {
  switch (job.name) {
    case 'metadata':
      return getMetadataJob(job)
    default:
      console.error(`Job ${job.name} not found in ${job.queueName} queue`)
  }
}

export const metadataQueue = new Queue('metadata', {
  connection: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
})

export const metadataQueueScheduler = new QueueScheduler(metadataQueue.name, {
  connection: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
})

export const metadataWorker = new Worker(metadataQueue.name, async job => queueSwitch(job), {
  limiter: {
    max: 1,
    duration: 1000,
  },
  connection: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
})

metadataWorker.on('completed', async job => {
  console.log(`${job.queueName} :: ${job.id} has completed!`)
  enqueueWebhook(job)
})

metadataWorker.on('failed', (job, err) => {
  console.log(`${job.queueName} :: ${job.id} has failed with ${err.message}`)
})

metadataWorker.on('progress', job => {
  console.log(`${job.queueName} :: ${job.id} has progress of ${job.progress}`)
})
