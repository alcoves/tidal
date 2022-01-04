import Joi from 'joi'
import { metadataQueue } from '../config/queues/metadata'
import { thumbnailQueue } from '../config/queues/thumbnail'
import { transcodeQueue } from '../config/queues/transcode'

export async function transcodeController(req, res) {
  const schema = Joi.object({
    entityId: Joi.string().required().max(50),
    input: Joi.object({
      bucket: Joi.string().required().max(255),
      key: Joi.string().required().max(255),
    }),
    output: Joi.object({
      bucket: Joi.string().required().max(255),
      key: Joi.string().required().max(255),
    }),
  })

  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })

  if (error) return res.status(400).json(error)

  await transcodeQueue.add('transcode', value)
  return res.sendStatus(202)
}

export async function metadataController(req, res) {
  const schema = Joi.object({
    entityId: Joi.string().required().max(50),
    input: Joi.object({
      bucket: Joi.string().required().max(255),
      key: Joi.string().required().max(255),
    }),
  })

  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })

  if (error) return res.status(400).json(error)

  await metadataQueue.add('metadata', value)
  return res.sendStatus(202)
}

export async function thumbnailController(req, res) {
  const schema = Joi.object({
    entityId: Joi.string().required().max(50),
    input: Joi.object({
      bucket: Joi.string().required().max(255),
      key: Joi.string().required().max(255),
    }),
    output: Joi.object({
      bucket: Joi.string().required().max(255),
      key: Joi.string().required().max(255),
    }),
  })

  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })

  if (error) return res.status(400).json(error)

  await thumbnailQueue.add('thumbnail', value)
  return res.sendStatus(202)
}
