import url from 'url'
import path from 'path'
import queues from '../queues/queues'

import { db } from '../config/db'
import { v4 as uuidv4 } from 'uuid'
import s3, { genS3Uri, s3URI } from '../lib/s3'
import {
  IngestionJobData,
  TranscodeJobData,
  ThumbnailJobData,
  ThumbnailJobOptions,
  TranscodeJobOptions,
} from '../types'

export async function enqueueIngestionJob(input: string) {
  const videoId = uuidv4()
  const ingestionId = uuidv4()
  const jobName = 'ingestion'
  const queueName = 'ingestion'

  const cleanedUrl = url.parse(input).pathname || ''
  const sourceFileExtension = path.extname(cleanedUrl) || ''

  const s3Uri = genS3Uri({
    Bucket: process.env.TIDAL_BUCKET || '',
    Key: `assets/videos/${videoId}/source${sourceFileExtension}`,
  })

  const ingestionJob: IngestionJobData = {
    input,
    videoId,
    ingestionId,
    s3OutputUri: s3Uri,
  }

  const video = await db.video.create({
    data: {
      id: videoId,
      source: {
        create: {
          input,
          s3Uri,
          id: ingestionId,
        },
      },
    },
  })

  console.log('VIDEO', video)

  await queues[queueName].queue.add(jobName, ingestionJob)
}

export async function enqueueThumbnailJob(videoId: string, opts?: ThumbnailJobOptions) {
  const thumbnailId = uuidv4()
  const jobName = 'thumbnail'
  const queueName = 'thumbnail'

  const video = await db.video.findUnique({ where: { id: videoId }, include: { source: true } })
  if (!video || !video.source) return

  const sourceUrl = await s3.getSignedUrlPromise('getObject', {
    Key: s3URI(video.source.s3Uri).Key,
    Bucket: s3URI(video.source.s3Uri).Bucket,
  })

  const s3Uri = genS3Uri({
    Bucket: process.env.TIDAL_BUCKET || '',
    Key: `assets/videos/${videoId}/thumbnails/${thumbnailId}.webp`,
  })

  const thumbnailJob: ThumbnailJobData = {
    videoId,
    thumbnailId,
    fit: opts?.fit || 'cover',
    time: opts?.time || '0',
    width: opts?.width || 854,
    height: opts?.height || 452,
    input: sourceUrl,
    output: s3Uri,
  }

  await db.thumbnail.create({
    data: {
      s3Uri,
      videoId,
      id: thumbnailId,
    },
  })

  await queues[queueName].queue.add(jobName, thumbnailJob)
}

export async function enqueueTranscodeJob(videoId: string, opts?: TranscodeJobOptions) {
  const transcodeId = uuidv4()
  const jobName = 'transcode'
  const queueName = 'transcodes'

  const video = await db.video.findUnique({ where: { id: videoId }, include: { source: true } })
  if (!video || !video.source) return

  const sourceUrl = await s3.getSignedUrlPromise('getObject', {
    Key: s3URI(video.source.s3Uri).Key,
    Bucket: s3URI(video.source.s3Uri).Bucket,
  })

  const transcodeJob: TranscodeJobData = {
    videoId,
    transcodeId,
    input: sourceUrl,
    cmd: opts?.cmd || '',
  }

  await db.transcode.create({
    data: {
      id: transcodeId,
      videoId,
      s3Uri: genS3Uri({
        Bucket: process.env.TIDAL_BUCKET || '',
        Key: `assets/videos/${videoId}/transcodes/${transcodeId}/out.mp4`,
      }),
    },
  })

  await queues[queueName].queue.add(jobName, transcodeJob)
}
