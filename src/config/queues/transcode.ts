import { enqueueWebhook } from './webhook'
import { hlsFlowProducer } from '../flows/hls'
import { packageHls } from '../../jobs/package'
import { transcode } from '../../jobs/transcode'
import { Queue, Worker, QueueScheduler, Job } from 'bullmq'

const concurrency = process.env.CONCURRENT_TRANSCODE_JOBS
  ? parseInt(process.env.CONCURRENT_TRANSCODE_JOBS)
  : 1

// Increasing the lock duration attempts to avoid stalling jobs
const lockDuration = 1000 * 240 // 4 minutes

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
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      delay: 1000,
      type: 'exponential',
    },
  },
})

export const transcodeQueueScheduler = new QueueScheduler(transcodeQueue.name, {
  connection: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
})

if (!process.env.DISABLE_JOBS) {
  const transcodeWorker = new Worker(transcodeQueue.name, async job => queueSwitch(job), {
    concurrency,
    limiter: {
      max: 1,
      duration: 1000,
    },
    lockDuration: lockDuration,
    lockRenewTime: lockDuration / 4,
    connection: {
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST,
      password: process.env.REDIS_PASSWORD,
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
    if (job.name === 'transcode') {
      if (job.data.parentId) {
        const tree = await hlsFlowProducer.getFlow({
          id: job.data.parentId,
          queueName: 'transcode',
        })

        if (tree.children) {
          const sumPercentageCompleted = tree.children.reduce((acc: any, { job }) => {
            acc += job.progress
            return acc
          }, 0)
          const percentageDone = sumPercentageCompleted / tree.children.length - 5
          if (percentageDone >= 0) await tree.job.updateProgress(percentageDone)
          // Bullmq parent flow jobs don't start triggering progress updated util the job is running
          // So we have to enqueue the webhook data manually here
          await enqueueWebhook(tree.job)
        }
      }
    } else {
      console.log(`${job.queueName} :: ${job.id} has progress of ${job.progress}`)
      await enqueueWebhook(job)
    }
  })
}