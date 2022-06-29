import Joi from 'joi'
import { v4 as uuidv4 } from 'uuid'
import { queues } from '../lib/bullmq'
import { ImportAssetData, ThumbnailJobData } from '../types'

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

export async function createVideo(req, res) {
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

  const id = uuidv4()
  const importAssetJob: ImportAssetData = {
    id,
    input: value.input,
    output: value.output,
    assetId: value.assetId,
  }

  if (queues.import) await queues.import.queue.add('import', importAssetJob, { jobId: id })
  return res.sendStatus(202)
}
