import { enqueueWebhook } from './webhook'
import { defaultConnection } from '../redis'
import { Queue, Worker, QueueScheduler, Job } from 'bullmq'
import { createThumbnail } from '../../jobs/createThumbnail'

// Increasing the lock duration attempts to avoid stalling jobs
const lockDuration = 1000 * 240 // 4 minutes

function queueSwitch(job: Job) {
  switch (job.name) {
    case 'thumbnail':
      return createThumbnail(job)
    default:
      console.error(`Job ${job.name} not found in ${job.queueName} queue`)
  }
}

export const thumbnailQueue = new Queue('thumbnail', {
  connection: defaultConnection,
  defaultJobOptions: {
    attempts: 4,
    backoff: {
      delay: 1000,
      type: 'exponential',
    },
  },
})

export const thumbnailQueueScheduler = new QueueScheduler(thumbnailQueue.name, {
  connection: defaultConnection,
})

if (!process.env.DISABLE_JOBS) {
  const thumbnailWorker = new Worker(thumbnailQueue.name, async job => queueSwitch(job), {
    limiter: {
      max: 1,
      duration: 1000,
    },
    lockDuration: lockDuration,
    lockRenewTime: lockDuration / 4,
    connection: defaultConnection,
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
