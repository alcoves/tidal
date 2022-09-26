import { connection } from './connection'
import { webhookJob } from '../jobs/webhook'
import { Queue, QueueScheduler, Worker } from 'bullmq'
import { onCompleted, onFailed, onProgress } from './workerEvents'

const config = {
  queueName: 'webhooks',
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
  const worker = new Worker(config.queueName, webhookJob, {
    connection,
    concurrency: 4,
    lockDuration: config.lockDuration,
    lockRenewTime: config.lockDuration / 4,
    limiter: { max: config.WORKER_DISABLED ? 0 : 1, duration: 1000 },
  })

  const scheduler = new QueueScheduler(config.queueName, { connection })

  worker.on('progress', job => onProgress(job, config.WEBHOOKS_DISABLED))
  worker.on('completed', job => onCompleted(job, config.WEBHOOKS_DISABLED))
  worker.on('failed', (job, err) => onFailed(job, err, config.WEBHOOKS_DISABLED))

  return worker
}

export function scheduler() {
  return new QueueScheduler(config.queueName, { connection })
}
