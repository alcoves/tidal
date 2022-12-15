import envVars from '../config/envVars'
import { QueueFactory, QueueFactoryOptions } from '../types'
import { Queue, Worker, FlowProducer, ConnectionOptions } from 'bullmq'

if (!envVars.redisPort) process.exit(1)
if (!envVars.redisHost) process.exit(1)
if (!envVars.redisPassword) process.exit(1)

const msg = `Trying to connect to ${envVars.redisHost}:${envVars.redisPort}`
console.log(msg)

export const connection: ConnectionOptions = {
  host: envVars.redisHost,
  password: envVars.redisPassword,
  port: Number(envVars.redisPort),
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
