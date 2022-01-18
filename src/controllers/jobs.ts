import Joi from 'joi'
import { v4 as uuidv4 } from 'uuid'
import { getSignedURL } from '../config/s3'
import { hlsFlowProducer } from '../config/flows/hls'
import { metadataQueue } from '../config/queues/metadata'
import { thumbnailQueue } from '../config/queues/thumbnail'
import { transcodeQueue } from '../config/queues/transcode'

export async function transcodeHlsController(req, res) {
  const schema = Joi.object({
    entityId: Joi.string().required().max(50),
    input: Joi.object({
      bucket: Joi.string().required().max(255),
      key: Joi.string().required().max(255),
    }),
    output: Joi.object({
      bucket: Joi.string().required().max(255),
      path: Joi.string().required().max(255),
    }),
  })

  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })

  if (error) return res.status(400).json(error)

  const signedUrl = await getSignedURL({ Bucket: value.input.bucket, Key: value.input.key })

  function childJobs(parentJobId: string): any[] {
    const resolutions = ['240p', '360p', '480p', '720p', '1080p'] //  '1440p', '2160p'
    return resolutions.map((r: string) => {
      return {
        name: 'transcode',
        queueName: 'transcode',
        data: {
          resolution: r,
          input: signedUrl,
          parentId: parentJobId,
          entityId: value.entityId,
        },
      }
    })
  }

  const parentJobId: string = uuidv4()

  await hlsFlowProducer.add({
    name: 'package-hls',
    queueName: 'transcode',
    data: { ...value },
    opts: { jobId: parentJobId },
    children: childJobs(parentJobId),
  })

  return res.sendStatus(202)
}

export async function transcodeProgressiveController(req, res) {
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
