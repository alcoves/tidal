import queues from '../queues/queues'

import { v4 as uuid } from 'uuid'
import { db } from '../config/db'
import globals from '../config/globals'
import s3, { deleteFolder } from '../lib/s3'
import { AdaptiveTranscodeJobData } from '../types'

export async function createVideoUploadLink(req, res) {
  const videoId = uuid()
  const videoFileId = uuid()

  const videoLocation = `assets/videos/${videoId}`
  const videoFileInputLocation = `${videoLocation}/files/${videoFileId}`
  const presignedPutRequest = await s3.getSignedUrlPromise('putObject', {
    Key: videoFileInputLocation,
    Bucket: globals.tidalBucket,
  })

  await db.video.create({
    data: {
      id: videoId,
      location: videoLocation,
      files: {
        create: {
          type: 'ORIGINAL',
          id: videoFileId,
          location: videoFileInputLocation,
        },
      },
    },
  })

  return res.json({
    videoId,
    link: presignedPutRequest,
  })
}

export async function deleteVideo(req, res) {
  const video = await db.video.findUnique({
    where: { id: req.params.videoId },
  })

  if (!video) return res.sendStatus(400)
  await deleteFolder(video.location)
  await db.video.delete({
    where: { id: req.params.videoId },
  })

  res.sendStatus(200)
}

export async function getVideo(req, res) {
  const videos = await db.video.findMany({
    orderBy: { createdAt: 'desc' },
    where: { id: req.params.videoId },
    include: {
      files: {
        orderBy: { type: 'asc' },
      },
      // thumbnails: {
      //   orderBy: { createdAt: 'desc' },
      // },
      // playbacks: {
      //   orderBy: { createdAt: 'desc' },
      // },
    },
  })
  if (videos.length) return res.json(videos[0])
  return res.sendStatus(404)
}

export async function listVideos(req, res) {
  const videos = await db.video.findMany({
    orderBy: { createdAt: 'desc' },
    // include: {
    //   thumbnails: {
    //     orderBy: { createdAt: 'desc' },
    //   },
    // },
  })
  res.json({ videos })
}

export async function startVideoProcessing(req, res) {
  const { videoId } = req.params

  const video = await db.video.findUnique({
    where: { id: videoId },
    include: {
      files: {
        where: {
          type: 'ORIGINAL',
        },
      },
    },
  })
  if (!video) return res.sendStatus(404)
  if (!video.files.length) return res.sendStatus(400)

  const originalVideoFile = video.files[0]

  await db.videoFile.update({
    where: { id: originalVideoFile.id },
    data: {
      status: 'READY',
    },
  })

  await queues.adaptiveTranscode.queue.add('adaptiveTranscode', {
    videoId,
    playbackId: uuid(),
    input: originalVideoFile.location,
  } as AdaptiveTranscodeJobData)

  return res.status(202).end()
}

// export async function createThumbnail(req, res) {
//   const { videoId } = req.params

//   const schema = Joi.object({
//     time: Joi.string().default('00:00:00:000'),
//     width: Joi.number().default(854).min(1).max(10000).required(),
//     height: Joi.number().default(400).min(1).max(10000).required(),
//     fit: Joi.string().uri().default('cover').valid('cover', 'contain', 'fill', 'inside', 'outside'),
//   })

//   const { error, value } = schema.validate(req.body, {
//     abortEarly: false, // include all errors
//     allowUnknown: true, // ignore unknown props
//     stripUnknown: true, // remove unknown props
//   })
//   if (error) return res.status(400).json(error)

//   await enqueueThumbnailJob(videoId, {
//     fit: value.fit,
//     time: value.time,
//     width: value.width,
//     height: value.height,
//   })

//   return res.status(202).end()
// }
