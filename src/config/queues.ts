import { TidalQueue } from '../types'
import { defaultConnection } from './redis'
import { onCompleted, onFailed, onProgress } from './workerEvents'
import { Queue, Worker, QueueScheduler, FlowProducer, Job } from 'bullmq'

import { concatJob } from '../jobs/concat'
import { importJob } from '../jobs/import'
import { publishJob } from '../jobs/publish'
import { packageJob } from '../jobs/package'
import { thumbnailJob } from '../jobs/thumbnail'
import { transcodeJob } from '../jobs/transcode'

export const flow = new FlowProducer({
  connection: defaultConnection,
})

// Increasing the lock duration attempts to avoid stalling jobs
const lockDuration = 1000 * 240 // 4 minutes

async function queueSwitch(job: Job) {
  const handler = job.queueName
  switch (handler) {
    case 'import':
      return importJob(job)
    case 'publish':
      return publishJob(job)
    case 'transcode':
      return transcodeJob(job)
    case 'thumbnail':
      return thumbnailJob(job)
    case 'concat':
      return concatJob(job)
    case 'package':
      return packageJob(job)
    default:
      throw new Error('Unknown handler')
  }
}

export const queues: TidalQueue[] = [
  'import',
  'export',
  'concat',
  'package',
  'metadata',
  'thumbnail',
  'transcode',
].map(queueName => {
  const queue = {
    name: queueName,
    queue: new Queue(queueName, {
      connection: defaultConnection,
      defaultJobOptions: {
        attempts: 4,
        backoff: { delay: 1000, type: 'exponential' },
      },
    }),
    worker: new Worker(queueName, queueSwitch, {
      concurrency: 4,
      lockDuration: lockDuration,
      connection: defaultConnection,
      lockRenewTime: lockDuration / 4,
      limiter: { max: 1, duration: 1000 },
    }),
    scheduler: new QueueScheduler(queueName, { connection: defaultConnection }),
  }

  queue.worker.on('failed', onFailed)
  queue.worker.on('completed', onCompleted)
  queue.worker.on('progress', job => onProgress(job, queueName))

  return queue
})

export function getQueueByName(name: string): TidalQueue | undefined {
  return queues.find(q => q.name === name)
}
