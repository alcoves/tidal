import { Queue, Worker, QueueScheduler, Job } from 'bullmq'
import { createThumbnail } from '../../jobs/createThumbnail'
import { enqueueWebhook, webhookQueue } from './webhook'

function queueSwitch(job: Job) {
  switch (job.name) {
    case 'thumbnail':
      return createThumbnail(job)
    default:
      console.error(`Job ${job.name} not found in ${job.queueName} queue`)
  }
}

export const thumbnailQueue = new Queue('thumbnail', {
  connection: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 4,
    backoff: {
      delay: 1000,
      type: 'exponential',
    },
  },
})

export const thumbnailQueueScheduler = new QueueScheduler(thumbnailQueue.name, {
  connection: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
})

if (!process.env.DISABLE_JOBS) {
  const thumbnailWorker = new Worker(thumbnailQueue.name, async job => queueSwitch(job), {
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

  thumbnailWorker.on('completed', async job => {
    console.log(`${job.queueName} :: ${job.id} has completed!`)
    enqueueWebhook(job)
  })

  thumbnailWorker.on('failed', (job, err) => {
    console.log(`${job.queueName} :: ${job.id} has failed with ${err.message}`)
  })

  thumbnailWorker.on('progress', job => {
    console.log(`${job.queueName} :: ${job.id} has progress of ${job.progress}`)
  })
}
