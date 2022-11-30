import Joi from 'joi'
import { db } from '../config/db'
import { deleteFolder } from '../lib/s3'
import {
  enqueueIngestionJob,
  // enqueuePlaybackJob,
  // enqueueThumbnailJob,
  enqueueTranscodeJob,
} from '../services/bullmq'

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
    where: { id: req.params.videoId, deleted: false },
    include: {
      // thumbnails: {
      //   where: { deleted: false },
      //   orderBy: { createdAt: 'desc' },
      // },
      files: {
        where: { deleted: false },
        orderBy: { type: 'desc' },
      },
      // playbacks: {
      //   where: { deleted: false },
      //   orderBy: { createdAt: 'desc' },
      //   include: {
      //     transcodes: {
      //       orderBy: { createdAt: 'desc' },
      //     },
      //   },
      // },
    },
  })
  if (videos.length) return res.json(videos[0])
  return res.sendStatus(404)
}

export async function listVideos(req, res) {
  const videos = await db.video.findMany({
    where: { deleted: false },
    orderBy: { createdAt: 'desc' },
    // include: {
    //   thumbnails: {
    //     where: { deleted: false },
    //     orderBy: { createdAt: 'desc' },
    //   },
    // },
  })
  res.json({ videos })
}

export async function createVideo(req, res) {
  const schema = Joi.object({
    input: Joi.string().uri().required(),
  })

  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })
  if (error) return res.status(400).json(error)

  await enqueueIngestionJob(value.input)

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

export async function createRendition(req, res) {
  const { videoId } = req.params
  const schema = Joi.object({
    cmd: Joi.string().required(),
    container: Joi.string().required(),
  })

  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })
  if (error) return res.status(400).json(error)

  const video = await db.video.findUnique({
    where: { id: videoId },
  })
  if (!video) return res.sendStatus(404)

  await enqueueTranscodeJob(videoId, {
    videoId,
    cmd: value.cmd,
    container: value.container,
  })

  return res.status(202).end()
}
