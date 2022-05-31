import Joi from 'joi'
import { FlowJob } from 'bullmq'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../utils/redis'
import { getSignedURL } from '../config/s3'
import { metadataQueue } from '../config/queues/metadata'
import { thumbnailQueue } from '../config/queues/thumbnail'
import { transcodeFlowProducer } from '../config/flows/transcode'
import { OutputJobData, Preset, TranscodeJobData } from '../types'
import { checkDimensionContraints, getMetadata } from '../utils/video'

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

  let signedUrl = ''
  if (value.input.includes('s3://')) {
    const Bucket = value.input.split('s3://')[1].split('/')[0]
    const Key = value.input.split('s3://')[1].split('/')[1]
    signedUrl = await getSignedURL({ Bucket, Key })
  }
  const metadata = await getMetadata(signedUrl || value.input)

  const filteredPresets: Preset[] = presets.filter(preset => {
    return checkDimensionContraints({
      sourceWidth: metadata?.video?.width,
      sourceHeight: metadata?.video?.height,
      maxWidth: preset?.constraints?.width,
      maxHeight: preset?.constraints?.height,
    })
  })

  const pacakageCommands: string[] = filteredPresets
    .filter(preset => {
      return preset.package_cmd
    })
    .map(preset => {
      return preset.package_cmd
    })

  function childJobs(parentJobId: string): FlowJob[] {
    return filteredPresets.map((preset: Preset) => {
      const jobData: TranscodeJobData = {
        cmd: preset.cmd,
        input: value.input,
        output: value.output,
        parentId: parentJobId,
        webhooks: value.webhooks,
      }
      const job: FlowJob = {
        data: jobData,
        name: 'preset',
        queueName: 'transcode',
      }
      return job
    })
  }

  const parentJobId: string = uuidv4()

  const outputJobData: OutputJobData = {
    input: value.input,
    output: value.output,
    package_cmds: pacakageCommands,
  }
  const job = {
    name: 'output',
    data: outputJobData,
    queueName: 'transcode',
    children: childJobs(parentJobId),
    opts: { jobId: parentJobId, priority: 1 },
  }
  await transcodeFlowProducer.add(job)
  return res.json(job)
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
