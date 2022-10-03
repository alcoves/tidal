import chalk from 'chalk'
import { db } from '../config/db'
import s3 from '../lib/s3'
import queues from '../queues/queues'
import { ThumbnailJobData } from '../types'

export async function defaultIngestionJobs(videoId: string) {
  const video = await db.video.findUnique({ where: { id: videoId }, include: { source: true } })
  if (!video || !video.source) return

  const sourceUrl = await s3.getSignedUrlPromise('getObject', {
    Key: video.source.s3Key,
    Bucket: process.env.TIDAL_BUCKET,
  })

  console.log(chalk.blue(`creating thumbnail job`))
  const thumbnail = await db.thumbnail.create({
    data: { videoId },
  })
  const thumbnailJob: ThumbnailJobData = {
    fit: 'cover',
    time: '0',
    width: 854,
    height: 452,
    input: sourceUrl,
    assetId: videoId,
    output: `assets/videos/${videoId}/thumbnails/${thumbnail.id}.webp`,
  }
  await queues.thumbnail.queue.add('thumbnail', thumbnailJob)

  console.log(chalk.blue(`creating encoding jobs`))
  // HLS encoding job
  // Archive encoding job
}
