import { db } from '../config/db'
import { v4 as uuidv4 } from 'uuid'
import s3, { genS3Uri, s3URI } from '../lib/s3'
import { TranscodeJobData, TranscodeJobOptions } from '../types'

import queues from '../queues/queues'

export async function enqueueTranscodeJob(videoId: string, opts?: TranscodeJobOptions) {
  const video = await db.video.findUnique({ where: { id: videoId } })
  if (!video) return

  const sourceUrl = await s3.getSignedUrlPromise('getObject', {
    Key: s3URI(video.s3Uri).Key,
    Bucket: s3URI(video.s3Uri).Bucket,
  })
  const transcodeId = uuidv4()
  const s3Uri = genS3Uri({
    Bucket: process.env.TIDAL_BUCKET || '',
    Key: `assets/videos/${videoId}/transcodes/${transcodeId}/out.mp4`,
  })

  await db.transcode.create({
    data: { id: transcodeId, videoId, s3Uri },
  })

  const transcodeJob: TranscodeJobData = {
    transcodeId,
    input: sourceUrl,
    cmd: opts?.cmd || '',
  }

  await queues.transcodes.queue.add('transcode', transcodeJob)
}
