import { defaultConnection } from './redis'
import { Queue, Worker, QueueScheduler, FlowProducer } from 'bullmq'

import { ffmpegJob } from '../jobs/ffmpeg'
import { outputJob } from '../jobs/output'
import { packageJob } from '../jobs/package'
import { ffprobeJob } from '../jobs/ffprobe'
import { enqueueWebhook } from './webhooks'
import { webhookJob } from '../jobs/webhook'
import { TidalQueue } from '../types'

export const flow = new FlowProducer({
  connection: defaultConnection,
})

// Increasing the lock duration attempts to avoid stalling jobs
const lockDuration = 1000 * 240 // 4 minutes

const queues: TidalQueue[] = [
  {
    name: 'output',
    fn: outputJob,
    disabled: false,
    queueOptions: {
      connection: defaultConnection,
      defaultJobOptions: {
        attempts: 2,
        backoff: { delay: 1000, type: 'exponential' },
      },
    },
    workerOptions: {
      concurrency: 1,
      lockDuration: lockDuration,
      connection: defaultConnection,
      lockRenewTime: lockDuration / 4,
      limiter: { max: 1, duration: 1000 },
    },
    queueSchedulerOptions: { connection: defaultConnection },
  },
  {
    name: 'package',
    fn: packageJob,
    disabled: false,
    queueOptions: {
      connection: defaultConnection,
      defaultJobOptions: {
        attempts: 1,
        backoff: { delay: 1000, type: 'exponential' },
      },
    },
    workerOptions: {
      concurrency: 5,
      lockDuration: lockDuration,
      connection: defaultConnection,
      lockRenewTime: lockDuration / 4,
      limiter: { max: 1, duration: 1000 },
    },
    queueSchedulerOptions: { connection: defaultConnection },
  },
  {
    name: 'ffmpeg',
    fn: ffmpegJob,
    disabled: false,
    queueOptions: {
      connection: defaultConnection,
      defaultJobOptions: {
        attempts: 5,
        backoff: { delay: 1000, type: 'exponential' },
      },
    },
    workerOptions: {
      concurrency: 1,
      lockDuration: lockDuration,
      connection: defaultConnection,
      lockRenewTime: lockDuration / 4,
      limiter: { max: 1, duration: 1000 },
    },
    queueSchedulerOptions: { connection: defaultConnection },
  },
  {
    name: 'ffprobe',
    fn: ffprobeJob,
    disabled: false,
    queueOptions: {
      connection: defaultConnection,
      defaultJobOptions: {
        attempts: 5,
        backoff: { delay: 1000, type: 'exponential' },
      },
    },
    workerOptions: {
      concurrency: 1,
      lockDuration: lockDuration,
      connection: defaultConnection,
      lockRenewTime: lockDuration / 4,
      limiter: { max: 1, duration: 1000 },
    },
    queueSchedulerOptions: { connection: defaultConnection },
  },
  {
    name: 'webhooks',
    fn: webhookJob,
    disabled: false,
    queueOptions: {
      connection: defaultConnection,
      defaultJobOptions: {
        attempts: 5,
        backoff: { delay: 1000, type: 'exponential' },
      },
    },
    workerOptions: {
      concurrency: 5,
      lockDuration: lockDuration,
      connection: defaultConnection,
      lockRenewTime: lockDuration / 4,
      limiter: { max: 1, duration: 1000 },
    },
    queueSchedulerOptions: { connection: defaultConnection },
  },
]

for (const queue of queues) {
  const { name, fn, disabled, queueOptions, workerOptions, queueSchedulerOptions } = queue
  if (disabled) continue

  queues[name] = {
    queue: new Queue(name, queueOptions),
    worker: new Worker(name, fn, workerOptions),
    scheduler: new QueueScheduler(name, queueSchedulerOptions),
  }

  queues[name].worker.on('completed', async job => {
    console.log(`${job.queueName} :: ${job.id} has completed!`)
    if (!job.data?.webhooks) return
    await enqueueWebhook(job)
  })

  queues[name].worker.on('failed', async (job, err) => {
    console.log(`${job.queueName} :: ${job.id} has failed with ${err.message}`)
    if (!job.data?.webhooks) return
  })

  queues[name].worker.on('progress', async job => {
    console.log(`${job.queueName} :: ${job.id} has progress of ${job.progress}`)
    if (!job.data?.webhooks) return

    if (job.data.parentId) {
      const tree = await flow.getFlow({
        queueName: name,
        id: job.data.parentId,
      })

      if (tree.children) {
        const sumPercentageCompleted = tree.children.reduce((acc: any, { job }) => {
          acc += job.progress
          return acc
        }, 0)
        const percentageDone = sumPercentageCompleted / tree.children.length - 5
        if (percentageDone >= 0) await tree.job.updateProgress(percentageDone)
      }
    }

    await enqueueWebhook(job)
  })
}

export function getTidalQueue(name: string): TidalQueue {
  return queues[name]
}

export function getTidalQueues(): TidalQueue[] {
  return queues
}
