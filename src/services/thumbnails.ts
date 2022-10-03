import { db } from '../config/db'
import { v4 as uuidv4 } from 'uuid'
import s3, { genS3Uri, s3URI } from '../lib/s3'
import { ThumbnailJobData, ThumbnailJobOptions } from '../types'

import queues from '../queues/queues'

export async function enqueueThumbnailJob(videoId: string, opts?: ThumbnailJobOptions) {
  const video = await db.video.findUnique({ where: { id: videoId } })
  if (!video) return

  const sourceUrl = await s3.getSignedUrlPromise('getObject', {
    Key: s3URI(video.s3Uri).Key,
    Bucket: s3URI(video.s3Uri).Bucket,
  })
  const thumbnailId = uuidv4()
  const s3Uri = genS3Uri({
    Bucket: process.env.TIDAL_BUCKET || '',
    Key: `assets/videos/${videoId}/thumbnails/${thumbnailId}.webp`,
  })

  await db.thumbnail.create({
    data: { id: thumbnailId, videoId, s3Uri },
  })

  const thumbnailJob: ThumbnailJobData = {
    fit: opts?.fit || 'cover',
    time: opts?.time || '0',
    width: opts?.width || 854,
    height: opts?.height || 452,
    input: sourceUrl,
    assetId: videoId,
    output: s3Uri,
  }

  await queues.thumbnail.queue.add('thumbnail', thumbnailJob)
}
