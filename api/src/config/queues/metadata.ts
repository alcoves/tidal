import { enqueueWebhook } from './webhook'
import { defaultConnection } from '../redis'
import { getMetadataJob } from '../../jobs/getMetadata'
import { Queue, Worker, QueueScheduler, Job } from 'bullmq'

// Increasing the lock duration attempts to avoid stalling jobs
const lockDuration = 1000 * 240 // 4 minutes

function queueSwitch(job: Job) {
  switch (job.name) {
    case 'metadata':
      return getMetadataJob(job)
    default:
      console.error(`Job ${job.name} not found in ${job.queueName} queue`)
  }
}

export const metadataQueue = new Queue('metadata', {
  connection: defaultConnection,
  defaultJobOptions: {
    attempts: 4,
    backoff: {
      delay: 1000,
      type: 'exponential',
    },
  },
})

export const metadataQueueScheduler = new QueueScheduler(metadataQueue.name, {
  connection: defaultConnection,
})

if (!process.env.DISABLE_JOBS) {
  const metadataWorker = new Worker(metadataQueue.name, async job => queueSwitch(job), {
    limiter: {
      max: 1,
      duration: 1000,
    },
    lockDuration: lockDuration,
    lockRenewTime: lockDuration / 4,
    connection: defaultConnection,
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
}
