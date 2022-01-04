import { transcode } from '../../jobs/transcode'
import { Queue, Worker, QueueScheduler, Job } from 'bullmq'
import { enqueueWebhook, webhookQueue } from './webhook'

function queueSwitch(job: Job) {
  switch (job.name) {
    case 'transcode':
      return transcode(job)
    default:
      console.error(`Job ${job.name} not found in ${job.queueName} queue`)
  }
}

export const transcodeQueue = new Queue('transcode', {
  connection: {
    port: 6379,
    host: 'localhost',
  },
})

export const transcodeQueueScheduler = new QueueScheduler(transcodeQueue.name, {
  connection: {
    port: 6379,
    host: 'localhost',
  },
})

export const transcodeWorker = new Worker(transcodeQueue.name, async job => queueSwitch(job), {
  limiter: {
    max: 1,
    duration: 1000,
  },
  connection: {
    port: 6379,
    host: 'localhost',
  },
})

transcodeWorker.on('completed', async job => {
  console.log(`${job.queueName} :: ${job.id} has completed!`)
  enqueueWebhook(job)
})

transcodeWorker.on('failed', async (job, err) => {
  console.log(`${job.queueName} :: ${job.id} has failed with ${err.message}`)
  enqueueWebhook(job)
})

transcodeWorker.on('progress', async job => {
  console.log(`${job.queueName} :: ${job.id} has progress of ${job.progress}`)
  enqueueWebhook(job)
})
