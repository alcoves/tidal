import Joi from 'joi'
import { db } from '../config/db'
import { v4 as uuidv4 } from 'uuid'
import { adaptiveTranscode, metadata, thumbnail } from '../queues/queues'
import { AdaptiveTranscodeJobData, MetadataJobData, ThumbnailJobData } from '../types'

export async function getVideo(req, res) {
  const video = await db.video.findUnique({ where: { id: req.params.videoId } })
  res.json(video)
}

export async function listVideos(req, res) {
  const videos = await db.video.findMany()
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

  const video = await db.video.create({
    data: {
      input: value.input,
    },
  })

  res.json(video)
}

export async function createMetadata(req, res) {
  const schema = Joi.object({
    assetId: Joi.string().required(),
    input: Joi.string().uri().required(),
  })

  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })
  if (error) return res.status(400).json(error)

  const metadataJob: MetadataJobData = {
    input: value.input,
    assetId: value.assetId,
  }

  const _metadataQueue = metadata.queue
  if (_metadataQueue) {
    const job = await _metadataQueue.add('metadata', metadataJob)
    return res.status(202).json({ id: job.id })
  }
  return res.status(400).end()
}

export async function createThumbnail(req, res) {
  const schema = Joi.object({
    assetId: Joi.string().required(),
    input: Joi.string().uri().required(),
    output: Joi.string().uri().required(),
    time: Joi.string().default('00:00:00:000'),
    width: Joi.number().min(1).max(10000).required(),
    height: Joi.number().min(1).max(10000).required(),
    fit: Joi.string().uri().default('cover').valid('cover', 'contain', 'fill', 'inside', 'outside'),
  })

  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })
  if (error) return res.status(400).json(error)

  const thumbnailJob: ThumbnailJobData = {
    fit: value.fit,
    time: value.time,
    input: value.input,
    width: value.width,
    height: value.height,
    assetId: value.assetId,
    output: value.output.replace('$id', uuidv4()),
  }

  const _thumbnailQueue = thumbnail.queue
  if (_thumbnailQueue) await _thumbnailQueue.add('thumbnail', thumbnailJob)
  return res.status(202).end()
}

export async function adaptiveTranscodeHandler(req, res) {
  const schema = Joi.object({
    assetId: Joi.string().required(),
    input: Joi.string().uri().required(),
    output: Joi.string().uri().required(),
  })

  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })
  if (error) return res.status(400).json(error)

  const _adaptiveTranscodeQueue = adaptiveTranscode.queue
  if (_adaptiveTranscodeQueue) {
    const adaptiveTranscodeJobData: AdaptiveTranscodeJobData = {
      input: value.input,
      output: value.output,
      assetId: value.assetId,
    }

    await _adaptiveTranscodeQueue.add('transcode', adaptiveTranscodeJobData)
    return res.status(202).end()
  }

  return res.status(400).end()
}
