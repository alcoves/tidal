import { connection } from './connection'
import { Job, Processor, Queue, Worker } from 'bullmq'
import { onCompleted, onFailed, onProgress } from './workerEvents'

interface QueueFactoryOptions {
  queueName: string
  concurrency: number
  lockDuration: number
  webhooksDisabled: boolean
  workerDisabled: boolean
  jobHandler: Processor
  workerOnFailed?: (job: Job<any, any, string>, error: Error) => void
  workerOnProgress?: (job: any) => void
  workerOnCompleted?: (job: any) => void
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

  worker.on('failed', (job, error, prev) =>
    onFailed(job, error, prev, {
      webhooksDisabled: config.webhooksDisabled,
    })
  )
  worker.on('progress', job => {
    onProgress(job, {
      webhooksDisabled: config.webhooksDisabled,
    })
  })
  worker.on('completed', job =>
    onCompleted(job, {
      webhooksDisabled: config.webhooksDisabled,
    })
  )

  return { queue, worker }
}
