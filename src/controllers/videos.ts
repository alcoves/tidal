import Joi from 'joi'
import { v4 as uuidv4 } from 'uuid'
import { queues } from '../lib/bullmq'
import { getShakaPackagingCommand } from '../lib/packaging'
import { AdaptiveTranscodeJobData, ThumbnailJobData } from '../types'
import {
  getMetadata,
  videoMetadataValidated,
  generateAdaptiveTranscodeCommands,
} from '../lib/video'

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

  if (queues.thumbnail) await queues.thumbnail.queue.add('thumbnail', thumbnailJob)
  return res.sendStatus(202)
}

export async function createAdaptiveTranscode(req, res) {
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

  const metadata = await getMetadata(value.input)
  const validatedVideo = videoMetadataValidated(metadata)
  if (!validatedVideo) return res.status(400).send('failed to validate video')

  if (queues.adaptiveTranscode) {
    const transcodeCommands = generateAdaptiveTranscodeCommands({ metadata })
    const adaptiveTranscodeJobData: AdaptiveTranscodeJobData = {
      input: value.input,
      output: value.output,
      assetId: value.assetId,
      transcodeCommands,
      packagingCommand: getShakaPackagingCommand(transcodeCommands),
    }

    await queues.adaptiveTranscode.queue.add('transcode', adaptiveTranscodeJobData)
    return res.status(202).json({
      metadata,
    })
  }

  return res.sendStatus(400)
}
