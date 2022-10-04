import { Queue, Worker } from 'bullmq'
import { connection } from './connection'
import { QueueFactory, QueueFactoryOptions } from '../types'

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

  if (config.onFailed) worker.on('failed', config.onFailed)
  if (config.onProgress) worker.on('progress', config.onProgress)
  if (config.onCompleted) worker.on('completed', config.onCompleted)

  return { queue, worker }
}
