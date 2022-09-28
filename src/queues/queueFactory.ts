import { connection } from './connection'
import { Processor, Queue, Worker } from 'bullmq'
import { onCompleted, onFailed, onProgress } from './workerEvents'

interface QueueFactoryOptions {
  queueName: string
  concurrency: number
  lockDuration: number
  workerDisabled: boolean
  webhooksDisabled: boolean
  jobHandler: Processor
}

interface QueueFactory {
  queue: Queue
  worker: Worker
}

export function queueFactory(config: QueueFactoryOptions): QueueFactory {
  const queue = new Queue(config.queueName, {
    connection,
    defaultJobOptions: {
      attempts: 4,
      backoff: { delay: 1000 * 30, type: 'exponential' },
    },
  })

  const worker = new Worker(config.queueName, config.jobHandler, {
    connection,
    concurrency: config.concurrency || 4,
    lockDuration: config.lockDuration,
    lockRenewTime: config.lockDuration / 4,
    limiter: { max: config.workerDisabled ? 0 : 1, duration: 1000 },
  })

  worker.on('progress', job => onProgress(job, config.webhooksDisabled))
  worker.on('completed', job => onCompleted(job, config.webhooksDisabled))
  worker.on('failed', (job, err) => onFailed(job, err, config.webhooksDisabled))

  return { queue, worker }
}
