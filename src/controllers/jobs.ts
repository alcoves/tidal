import Joi from 'joi'
import { FlowJob } from 'bullmq'
import { v4 as uuidv4 } from 'uuid'
import { getSignedURL } from '../config/s3'
import { hlsFlowProducer } from '../config/flows/hls'
import { metadataQueue } from '../config/queues/metadata'
import { thumbnailQueue } from '../config/queues/thumbnail'
import { createMainManifest } from '../jobs/package'
import { TranscodeJobData } from '../types'

export async function transcodeHlsController(req, res) {
  const schema = Joi.object({
    dispatchWebhook: Joi.bool().required().default(true),
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
      const jobData: TranscodeJobData = {
        resolution: r,
        inputURL: signedUrl,
        output: {
          bucket: value.output.bucket,
          key: `v/${value.entityId}/hls/${r}`,
        },
        parentId: parentJobId,
        entityId: value.entityId,
        dispatchWebhook: value.dispatchWebhook,
      }

      const job: FlowJob = {
        data: jobData,
        name: 'transcode',
        queueName: 'transcode',
      }
      return job
    })
  }

  const parentJobId: string = uuidv4()

  await hlsFlowProducer.add({
    name: 'package-hls',
    queueName: 'transcode',
    data: { ...value },
    children: childJobs(parentJobId),
    opts: { jobId: parentJobId, priority: 1 },
  })

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

export async function createManifest(req, res) {
  const schema = Joi.object({
    entityId: Joi.string().required().max(50),
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

  await createMainManifest(value.output.bucket, value.output.path, value.entityId)
  return res.sendStatus(200)
}
