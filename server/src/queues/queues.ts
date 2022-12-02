import { queueFactory } from './queueFactory'
import { thumbnailJob } from '../handlers/thumbnail'
import { adaptiveTranscode, thumbnail } from './workerEvents'
import { adaptiveTranscodeJob } from '../handlers/adaptiveTranscode'

const queues = {
  adaptiveTranscode: queueFactory({
    queueName: 'adaptiveTranscode',
    concurrency: 4,
    workerDisabled: false,
    lockDuration: 1000 * 240,
    jobHandler: adaptiveTranscodeJob,
    onFailed: adaptiveTranscode.onFailed,
    onProgress: adaptiveTranscode.onProgress,
    onCompleted: adaptiveTranscode.onCompleted,
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
