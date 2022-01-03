import Joi from 'joi'
import { transcodeQueue } from '../config/queues/transcode'
import { thumbnailQueue } from '../config/queues/thumbnail'
import { metadataQueue, metadataWorker } from '../config/queues/metadata'

export async function transcodeController(req, res) {
  const schema = Joi.object({
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

  const { id } = await metadataQueue.add('metadata', value)
  metadataWorker.on('completed', function (job) {
    if (job.id === id) {
      return res.json(job.data)
    }
  })
  metadataWorker.on('failed', function (job, err) {
    if (job.id === id) {
      return res.status(500).send(err)
    }
  })
}

export async function thumbnailController(req, res) {
  const schema = Joi.object({
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
