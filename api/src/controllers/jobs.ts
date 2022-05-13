import Joi from 'joi'
import { FlowJob } from 'bullmq'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../utils/redis'
import { metadataQueue } from '../config/queues/metadata'
import { thumbnailQueue } from '../config/queues/thumbnail'
// import { createMainManifest } from '../jobs/package'
import { Preset, TranscodeJobData } from '../types'
import { transcodeFlowProducer } from '../config/flows/transcode'

export async function transcodeController(req, res) {
  const schema = Joi.object({
    workflow: Joi.string().required().max(255),
    webhooks: Joi.boolean().default(false),
    input: Joi.string().required().max(1024),
    output: Joi.string().required().max(1024),
  })

  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })

  if (error) return res.status(400).json(error)

  const workflowQuery = await db.get(`tidal:workflows:${value.workflow}`)
  if (!workflowQuery) return res.sendStatus(400)
  const workflow = JSON.parse(workflowQuery)

  const presets: Preset[] = await Promise.all(
    workflow.presets.map((presetId: string) => {
      return db.get(`tidal:presets:${presetId}`).then(preset => {
        return JSON.parse(preset as string)
      })
    })
  )

  function childJobs(parentJobId: string): FlowJob[] {
    return presets.map((preset: Preset) => {
      const jobData: TranscodeJobData = {
        cmd: preset.cmd,
        input: value.input,
        output: value.output,
        parentId: parentJobId,
        webhooks: value.webhooks,
        constraints: {
          width: preset.constraints.width,
          height: preset.constraints.height,
        },
      }
      const job: FlowJob = {
        data: jobData,
        name: 'transcodePreset',
        queueName: 'transcode',
      }
      return job
    })
  }
  const parentJobId: string = uuidv4()

  await transcodeFlowProducer.add({
    data: { ...value },
    queueName: 'transcode',
    name: 'completeTranscode',
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
