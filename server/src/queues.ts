import { videoHandler } from './handlers/video'
import { queueFactory } from './lib/bullmq'

const defaultQueueHandlers = {
  onFailed: async (job, err: Error) => {
    console.debug(`${job.queueName}:${job.id} :: Error:${JSON.stringify(err)}`)
  },
  onProgress: async job => {
    console.debug(`${job.queueName}:${job.id} :: ${job.progress}`)
  },
  onCompleted: async job => {
    console.debug(`${job.queueName}:${job.id}`)
  },
}

async function jobSwitch(job) {
  switch (job.name) {
    case 'video':
      return videoHandler(job)
    default:
      throw new Error(`job ${job.name} is not implemented`)
  }
}

export const queues = {
  jobs: queueFactory({
    jobHandler: jobSwitch,
    concurrency: 4,
    queueName: 'jobs',
    workerDisabled: false,
    lockDuration: 1000 * 240,
    onFailed: defaultQueueHandlers.onFailed,
    onProgress: defaultQueueHandlers.onProgress,
    onCompleted: defaultQueueHandlers.onCompleted,
  }),
}
