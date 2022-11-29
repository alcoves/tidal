import url from 'url'
import path from 'path'
import queues from '../queues/queues'

import { db } from '../config/db'
import { v4 as uuidv4 } from 'uuid'
import s3, { generateS3Uri, parseS3Uri } from '../lib/s3'
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

  const location = generateS3Uri({
    Bucket: process.env.TIDAL_BUCKET || '',
    Key: `assets/videos/${videoId}`,
  })
  const videoInputLocation = `${location}/source${sourceFileExtension}`

  const ingestionJob: IngestionJobData = {
    input,
    videoId,
    ingestionId,
    s3OutputUri: videoInputLocation,
  }

  await db.video.create({
    data: {
      location,
      id: videoId,
      renditions: {
        create: {
          input,
          type: 'ORIGINAL',
          id: ingestionId,
          location: videoInputLocation,
        },
      },
    },
  })

  await queues[queueName].queue.add(jobName, ingestionJob)
}

// export async function enqueueThumbnailJob(videoId: string, opts?: ThumbnailJobOptions) {
//   const thumbnailId = uuidv4()
//   const jobName = 'thumbnail'
//   const queueName = 'thumbnail'

//   const video = await db.video.findUnique({ where: { id: videoId }, include: { source: true } })
//   if (!video || !video.source) return

//   const sourceUrl = await s3.getSignedUrlPromise('getObject', parseS3Uri(video.source.s3Uri))

//   const s3Uri = generateS3Uri({
//     Bucket: process.env.TIDAL_BUCKET || '',
//     Key: `assets/videos/${videoId}/thumbnails/${thumbnailId}.webp`,
//   })

//   const thumbnailJob: ThumbnailJobData = {
//     videoId,
//     thumbnailId,
//     fit: opts?.fit || 'cover',
//     time: opts?.time || '0',
//     width: opts?.width || 854,
//     height: opts?.height || 452,
//     input: sourceUrl,
//     output: s3Uri,
//   }

//   await db.thumbnail.create({
//     data: {
//       s3Uri,
//       videoId,
//       id: thumbnailId,
//     },
//   })

//   await queues[queueName].queue.add(jobName, thumbnailJob)
// }

// export async function enqueueTranscodeJob(videoId: string, opts: TranscodeJobOptions) {
//   const transcodeId = uuidv4()
//   const jobName = 'transcode'
//   const queueName = 'transcodes'

//   const video = await db.video.findUnique({ where: { id: videoId }, include: { source: true } })
//   if (!video || !video.source) return

//   const sourceUrl = await s3.getSignedUrlPromise('getObject', parseS3Uri(video.source.s3Uri))

//   const s3OutputUri = generateS3Uri({
//     Bucket: process.env.TIDAL_BUCKET || '',
//     Key: `assets/videos/${videoId}/transcodes/${transcodeId}/${opts.filename}`,
//   })

//   const transcodeJob: TranscodeJobData = {
//     videoId,
//     transcodeId,
//     s3OutputUri,
//     cmd: opts.cmd,
//     input: sourceUrl,
//   }

//   await db.transcode.create({
//     data: {
//       videoId,
//       id: transcodeId,
//       s3Uri: s3OutputUri,
//       playbackId: opts.playbackId || '',
//     },
//   })

//   await queues[queueName].queue.add(jobName, transcodeJob)
// }

// export async function enqueuePlaybackJob(videoId: string) {
//   //
//   const playbackId = uuidv4()
//   const filename = 'playlist.m3u8'

//   const keyframes = ['-g', '60', '-keyint_min', '60', '-force_key_frames', 'expr:gte(t,n_forced*2)']

//   const hlsDefaults = [
//     '-master_pl_name',
//     'main.m3u8',
//     '-hls_segment_type',
//     'fmp4',
//     '-hls_flags',
//     'single_file',
//     '-hls_time',
//     '4',
//     '-hls_playlist_type',
//     'vod',
//   ]

//   const videoFilters = [
//     `scale=${1280}:${1280}:force_original_aspect_ratio=decrease`,
//     `scale=trunc(iw/2)*2:trunc(ih/2)*2`,
//   ]

//   const x264Defaults = [
//     '-vf',
//     videoFilters.join(','),
//     // '-vsync',
//     // '1', Constant framerate
//     '-an',
//     '-c:v',
//     'libx264',
//     '-crf',
//     '26',
//     '-maxrate',
//     '1M',
//     '-bufsize',
//     '2M',
//     '-preset',
//     'slow',
//     '-profile:v',
//     'high',
//     '-pix_fmt',
//     'yuv420p',
//     ...keyframes,
//   ]

//   const fullCommand = [...hlsDefaults, ...x264Defaults].join(' ')

//   await db.playback.create({
//     data: {
//       id: playbackId,
//       videoId,
//     },
//   })

//   await enqueueTranscodeJob(videoId, {
//     videoId,
//     filename,
//     playbackId,
//     cmd: fullCommand,
//   })

//   await enqueueTranscodeJob(videoId, {
//     videoId,
//     filename,
//     playbackId,
//     cmd: fullCommand,
//   })

//   await enqueueTranscodeJob(videoId, {
//     videoId,
//     filename,
//     playbackId,
//     cmd: fullCommand,
//   })
// }
