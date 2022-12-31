import s3 from './lib/s3'
import { Job } from 'bullmq'
import envVars from './config/envVars'
import { queueFactory } from './lib/bullmq'
import { videoHandler } from './handlers/video'
import { transcodeHandler } from './handlers/transcode'

async function pushJobState(job: Job) {
  return s3
    .upload({
      Key: `v/${job.id}/job.json`,
      Bucket: envVars.tidalBucket,
      Body: JSON.stringify(job.data),
    })
    .promise()
}

const defaultQueueHandlers = {
  onFailed: async (job: Job, err: Error) => {
    console.debug(`${job.queueName}:${job.id} :: Error:${JSON.stringify(err)}`)
    await pushJobState(job)
  },
  onProgress: async (job: Job) => {
    console.debug(`${job.queueName}:${job.id} :: ${job.progress}`)
    await pushJobState(job)
  },
  onCompleted: async (job: Job) => {
    console.debug(`${job.queueName}:${job.id}`)
    await pushJobState(job)
  },
}

async function jobSwitch(job: Job) {
  switch (job.name) {
    case 'video':
      return videoHandler(job)
    case 'transcode':
      return transcodeHandler(job)
    default:
      throw new Error(`job ${job.name} is not implemented`)
  }
}

export const queues = {
  jobs: queueFactory({
    jobHandler: jobSwitch,
    concurrency: 2,
    queueName: 'jobs',
    workerDisabled: false,
    lockDuration: 1000 * 240,
    onFailed: defaultQueueHandlers.onFailed,
    onProgress: defaultQueueHandlers.onProgress,
    onCompleted: defaultQueueHandlers.onCompleted,
  }),
}
