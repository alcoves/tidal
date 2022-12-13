import chalk from 'chalk'
import { QueueFactory, QueueFactoryOptions } from '../types'
import { Queue, Worker, FlowProducer, ConnectionOptions } from 'bullmq'

if (!process.env.REDIS_PORT) process.exit(1)
if (!process.env.REDIS_HOST) process.exit(1)
if (!process.env.REDIS_PASSWORD) process.exit(1)

const msg = `Trying to connect to ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
console.log(chalk.blue(msg))

export const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
  port: Number(process.env.REDIS_PORT),
}

export const flowProducer = new FlowProducer({
  connection,
})

export function queueFactory(config: QueueFactoryOptions): QueueFactory {
  const queue = new Queue(config.queueName, {
    connection,
    defaultJobOptions: {
      attempts: 0,
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

const defaultQueueHandlers = {
  onFailed: async (job, err: Error) => {
    console.debug(chalk.red.bold(`${job.queueName}:${job.id} :: Error:${JSON.stringify(err)}`))
  },
  onProgress: async job => {
    console.debug(chalk.yellow(`${job.queueName}:${job.id} :: ${job.progress}`))
  },
  onCompleted: async job => {
    console.debug(chalk.green.bold(`${job.queueName}:${job.id}`))
  },
}

async function jobHandler(job) {
  switch (job.name) {
    case 'video':
      return 'done'
    default:
      throw new Error(`job ${job.name} is not implemented`)
  }
}

export const queues = {
  jobs: queueFactory({
    jobHandler,
    concurrency: 4,
    queueName: 'jobs',
    workerDisabled: false,
    lockDuration: 1000 * 240,
    onFailed: defaultQueueHandlers.onFailed,
    onProgress: defaultQueueHandlers.onProgress,
    onCompleted: defaultQueueHandlers.onCompleted,
  }),
}

export default queues
