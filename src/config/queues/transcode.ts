import os from 'os'
import { enqueueWebhook } from './webhook'
import { packageHls } from '../../jobs/package'
import { transcode } from '../../jobs/transcode'
import { Queue, Worker, QueueScheduler, Job } from 'bullmq'

const CPU_COUNT = os.cpus().length
const concurrency = Math.round(CPU_COUNT / 4)

function queueSwitch(job: Job) {
  switch (job.name) {
    case 'package-hls':
      return packageHls(job)
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
  concurrency,
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
  if (job.name !== 'transcode') await enqueueWebhook(job)
})

transcodeWorker.on('failed', async (job, err) => {
  console.log(`${job.queueName} :: ${job.id} has failed with ${err.message}`)
  if (job.name !== 'transcode') await enqueueWebhook(job)
})

transcodeWorker.on('progress', async job => {
  console.log(`${job.queueName} :: ${job.id} has progress of ${job.progress}`)
  if (job.name !== 'transcode') await enqueueWebhook(job)
})
