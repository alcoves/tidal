import { Queue, Worker, QueueScheduler, Job } from 'bullmq'
import { getMetadata } from '../../jobs/getMetadata'

function queueSwitch(job: Job) {
  switch (job.name) {
    case 'metadata':
      return getMetadata(job)
    default:
      console.error(`Job ${job.name} not found in ${job.queueName} queue`)
  }
}

export const metadataQueue = new Queue('metadata', {
  connection: {
    port: 6379,
    host: 'localhost',
  },
})

export const metadataQueueScheduler = new QueueScheduler(metadataQueue.name, {
  connection: {
    port: 6379,
    host: 'localhost',
  },
})

export const metadataWorker = new Worker(metadataQueue.name, async job => queueSwitch(job), {
  limiter: {
    max: 1,
    duration: 1000,
  },
  connection: {
    port: 6379,
    host: 'localhost',
  },
})

metadataWorker.on('completed', job => {
  console.log(`${job.id} has completed!`)
})

metadataWorker.on('failed', (job, err) => {
  console.log(`${job.id} has failed with ${err.message}`)
})

metadataWorker.on('progress', job => {
  console.log(`${job.id} has progress of ${job.progress}`)
})
