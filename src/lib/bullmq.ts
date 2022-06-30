import chalk from 'chalk'
import { WebhookJobData } from '../types'
import { Queue, Worker, QueueScheduler, FlowProducer, Job } from 'bullmq'

import { concatJob } from '../jobs/concat'
import { importJob } from '../jobs/import'
import { publishJob } from '../jobs/publish'
import { packageJob } from '../jobs/package'
import { webhookJob } from '../jobs/webhook'
import { thumbnailJob } from '../jobs/thumbnail'
import { transcodeJob } from '../jobs/transcode'

const defaultConnection = {
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
}

export const flow = new FlowProducer({
  connection: defaultConnection,
})

// Increasing the lock duration attempts to avoid stalling jobs
const lockDuration = 1000 * 240 // 4 minutes

const shouldProcessJobs = process.env.DISABLE_JOBS === 'true' ? false : true
if (shouldProcessJobs) console.log(chalk.blue.bold('job processing spooling up...'))

export const queues = {
  import: {
    disableWebhooks: false,
    name: 'import',
    queue: new Queue('import', {
      connection: defaultConnection,
      defaultJobOptions: {
        attempts: 4,
        backoff: { delay: 1000, type: 'exponential' },
      },
    }),
    worker: shouldProcessJobs
      ? new Worker('import', importJob, {
          concurrency: 1,
          lockDuration: lockDuration,
          connection: defaultConnection,
          lockRenewTime: lockDuration / 4,
          limiter: { max: 1, duration: 1000 },
        })
      : null,
    scheduler: new QueueScheduler('import', { connection: defaultConnection }),
  },
  concat: {
    disableWebhooks: true,
    name: 'concat',
    queue: new Queue('concat', {
      connection: defaultConnection,
      defaultJobOptions: {
        attempts: 4,
        backoff: { delay: 1000, type: 'exponential' },
      },
    }),
    worker: shouldProcessJobs
      ? new Worker('concat', concatJob, {
          concurrency: 1,
          lockDuration: lockDuration,
          connection: defaultConnection,
          lockRenewTime: lockDuration / 4,
          limiter: { max: 1, duration: 1000 },
        })
      : null,
    scheduler: new QueueScheduler('concat', { connection: defaultConnection }),
  },
  publish: {
    disableWebhooks: false,
    name: 'publish',
    queue: new Queue('publish', {
      connection: defaultConnection,
      defaultJobOptions: {
        attempts: 4,
        backoff: { delay: 1000, type: 'exponential' },
      },
    }),
    worker: shouldProcessJobs
      ? new Worker('publish', publishJob, {
          concurrency: 1,
          lockDuration: lockDuration,
          connection: defaultConnection,
          lockRenewTime: lockDuration / 4,
          limiter: { max: 1, duration: 1000 },
        })
      : null,
    scheduler: new QueueScheduler('publish', { connection: defaultConnection }),
  },
  package: {
    disableWebhooks: true,
    name: 'package',
    queue: new Queue('package', {
      connection: defaultConnection,
      defaultJobOptions: {
        attempts: 4,
        backoff: { delay: 1000, type: 'exponential' },
      },
    }),
    worker: shouldProcessJobs
      ? new Worker('package', packageJob, {
          concurrency: 1,
          lockDuration: lockDuration,
          connection: defaultConnection,
          lockRenewTime: lockDuration / 4,
          limiter: { max: 1, duration: 1000 },
        })
      : null,
    scheduler: new QueueScheduler('package', { connection: defaultConnection }),
  },
  thumbnail: {
    disableWebhooks: false,
    name: 'thumbnail',
    queue: new Queue('thumbnail', {
      connection: defaultConnection,
      defaultJobOptions: {
        attempts: 4,
        backoff: { delay: 1000, type: 'exponential' },
      },
    }),
    worker: shouldProcessJobs
      ? new Worker('thumbnail', thumbnailJob, {
          concurrency: 1,
          lockDuration: lockDuration,
          connection: defaultConnection,
          lockRenewTime: lockDuration / 4,
          limiter: { max: 1, duration: 1000 },
        })
      : null,
    scheduler: new QueueScheduler('thumbnail', { connection: defaultConnection }),
  },
  transcode: {
    disableWebhooks: true,
    name: 'transcode',
    queue: new Queue('transcode', {
      connection: defaultConnection,
      defaultJobOptions: {
        attempts: 4,
        backoff: { delay: 1000, type: 'exponential' },
      },
    }),
    worker: shouldProcessJobs
      ? new Worker('transcode', transcodeJob, {
          concurrency: 2,
          lockDuration: lockDuration,
          connection: defaultConnection,
          lockRenewTime: lockDuration / 4,
          limiter: { max: 1, duration: 1000 },
        })
      : null,
    scheduler: new QueueScheduler('transcode', { connection: defaultConnection }),
  },
  webhooks: {
    name: 'webhooks',
    queue: new Queue('webhooks', {
      connection: defaultConnection,
      defaultJobOptions: {
        attempts: 2,
        backoff: { delay: 1000, type: 'exponential' },
      },
    }),
    worker: new Worker('webhooks', webhookJob, {
      concurrency: 4,
      lockDuration: lockDuration,
      connection: defaultConnection,
      lockRenewTime: lockDuration / 4,
      limiter: { max: 1, duration: 1000 },
    }),
    scheduler: new QueueScheduler('webhooks', { connection: defaultConnection }),
  },
}

for (const queue of Object.values(queues)) {
  if (queue.name !== 'webhooks' && queue.worker) {
    queue.worker.on('failed', onFailed)
    queue.worker.on('completed', onCompleted)
    queue.worker.on('progress', job => onProgress(job, queue.name))
  }
}

export async function enqueueWebhook(job: Job) {
  const webhookBody: WebhookJobData = {
    id: job.id,
    name: job.name,
    data: job.data,
    progress: job.progress,
    queueName: job.queueName,
    returnValue: job.returnvalue,
    state: await job.getState(),
  }
  queues.webhooks.queue.add('dispatch', webhookBody)
}

async function onCompleted(job: Job) {
  console.log(chalk.green.bold(`${job.queueName}:${job.id}`))
  if (process.env.DISABLE_WEBHOOKS === 'true' || queues[job.queueName].disableWebhooks) return
  await enqueueWebhook(job)
}

async function onFailed(job: Job, err) {
  console.log(chalk.red.bold(`${job.queueName}:${job.id} :: ${err.message}`))
  if (process.env.DISABLE_WEBHOOKS === 'true' || queues[job.queueName].disableWebhooks) return
  await enqueueWebhook(job)
}

async function onProgress(job: Job, queueName: string) {
  console.log(chalk.yellow(`${job.queueName}:${job.id} :: ${job.progress}`))
  if (process.env.DISABLE_WEBHOOKS === 'true' || queues[job.queueName].disableWebhooks) return
  await enqueueWebhook(job)

  // Sets the parent job progress to the sum of all child jobs
  // The only parent jobs right now are in the "publish" queue
  // if (job.data.parentId) {
  //   const tree = await flow.getFlow({
  //     queueName: 'publish',
  //     id: job.data.parentId,
  //   })

  //   if (tree?.children) {
  //     const sumPercentageCompleted = tree.children.reduce((acc: any, { job }) => {
  //       acc += job.progress
  //       return acc
  //     }, 0)
  //     const percentageDone = sumPercentageCompleted / tree.children.length - 5
  //     if (percentageDone >= 0) await tree.job.updateProgress(percentageDone)
  //   }
  // }
}
