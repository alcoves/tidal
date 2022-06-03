import { db } from '../utils/redis'
import { TidalQueue } from '../types'
import { defaultConnection } from './redis'
import { Queue, Worker, QueueScheduler, FlowProducer, Job } from 'bullmq'
import { onCompleted, onFailed, onProgress } from '../controllers/workerEvents'

import { outputJob } from '../jobs/output'
import { ffmpegJob } from '../jobs/ffmpeg'
import { packageJob } from '../jobs/package'
import { ffprobeJob } from '../jobs/ffprobe'

export const flow = new FlowProducer({
  connection: defaultConnection,
})

// Increasing the lock duration attempts to avoid stalling jobs
const lockDuration = 1000 * 240 // 4 minutes

export let queues: TidalQueue[] = []

export async function getTidalQueues(): Promise<any[]> {
  const keys = await db.keys('tidal:queues:*')
  const dbRes = await Promise.all(keys.map(k => db.get(k) || ''))
  return dbRes.map(r => {
    if (r) return JSON.parse(r)
  })
}

export function getQueueByName(name: string): TidalQueue | undefined {
  return queues.find(q => q.name === name)
}

async function queueSwitch(job: Job) {
  const handler = job.data?.handler
  switch (handler) {
    case 'output':
      return outputJob(job)
    case 'ffmpeg':
      return ffmpegJob(job)
    case 'ffprobe':
      return ffprobeJob(job)
    case 'package':
      return packageJob(job)
    default:
      throw new Error('Unknown handler')
  }
}

async function loadQueues() {
  const tidalQueues = await getTidalQueues()
  const fullQueues: TidalQueue[] = []

  for (const { name } of tidalQueues) {
    const fullQueue: TidalQueue = {
      name,
      queue: new Queue(name, {
        connection: defaultConnection,
        defaultJobOptions: {
          attempts: 2,
          backoff: { delay: 1000, type: 'exponential' },
        },
      }),
      worker: new Worker(name, queueSwitch, {
        concurrency: 1,
        lockDuration: lockDuration,
        connection: defaultConnection,
        lockRenewTime: lockDuration / 4,
        limiter: { max: 1, duration: 1000 },
      }),
      scheduler: new QueueScheduler(name, { connection: defaultConnection }),
    }

    fullQueue.worker.on('failed', onFailed)
    fullQueue.worker.on('progress', onCompleted)
    fullQueue.worker.on('completed', job => onProgress(job, name))

    fullQueues.push(fullQueue)
  }

  queues = fullQueues
}

loadQueues()
