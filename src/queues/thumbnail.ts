import { Queue, Worker } from 'bullmq'
import { connection } from './connection'
import { thumbnailJob } from '../jobs/thumbnail'
import { onCompleted, onFailed, onProgress } from './workerEvents'

const config = {
  queueName: 'thumbnail',
  WORKER_DISABLED: false,
  WEBHOOKS_DISABLED: false,
  lockDuration: 1000 * 240,
}

export function queue() {
  return new Queue(config.queueName, {
    connection,
    defaultJobOptions: {
      attempts: 4,
      backoff: { delay: 1000 * 30, type: 'exponential' },
    },
  })
}

export function worker() {
  const worker = new Worker(config.queueName, thumbnailJob, {
    connection,
    concurrency: 4,
    lockDuration: config.lockDuration,
    lockRenewTime: config.lockDuration / 4,
    limiter: { max: config.WORKER_DISABLED ? 0 : 1, duration: 1000 },
  })

  worker.on('progress', job => onProgress(job, config.WEBHOOKS_DISABLED))
  worker.on('completed', job => onCompleted(job, config.WEBHOOKS_DISABLED))
  worker.on('failed', (job, err) => onFailed(job, err, config.WEBHOOKS_DISABLED))

  return worker
}
