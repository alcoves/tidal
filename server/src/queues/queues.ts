import { queueFactory } from './queueFactory'
import { thumbnailJob } from '../handlers/thumbnail'
import { transcodeJob } from '../handlers/transcode'
import { packagingJob } from '../handlers/packaging'
import { transcode, packaging, thumbnail } from './workerEvents'

const queues = {
  packaging: queueFactory({
    queueName: 'packaging',
    concurrency: 4,
    workerDisabled: false,
    lockDuration: 1000 * 240,
    jobHandler: packagingJob,
    onFailed: packaging.onFailed,
    onProgress: packaging.onProgress,
    onCompleted: packaging.onCompleted,
  }),

  transcode: queueFactory({
    queueName: 'transcode',
    concurrency: 4,
    workerDisabled: false,
    lockDuration: 1000 * 240,
    jobHandler: transcodeJob,
    onFailed: transcode.onFailed,
    onProgress: transcode.onProgress,
    onCompleted: transcode.onCompleted,
  }),
  thumbnail: queueFactory({
    queueName: 'thumbnail',
    concurrency: 4,
    workerDisabled: false,
    lockDuration: 1000 * 240,
    jobHandler: thumbnailJob,
    onFailed: thumbnail.onFailed,
    onProgress: thumbnail.onProgress,
    onCompleted: thumbnail.onCompleted,
  }),
}

export default queues
