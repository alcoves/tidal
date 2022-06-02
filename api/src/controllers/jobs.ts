import Joi from 'joi'
import fs from 'fs-extra'
import { FlowJob } from 'bullmq'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../utils/redis'
import { getSignedURL } from '../config/s3'
import { transcodeFlowProducer } from '../config/flows/transcode'
import { OutputJobData, PackageJobData, Preset, FFmpegJobData } from '../types'
import { checkDimensionContraints, getMetadata } from '../utils/video'
import { transcodeQueue } from '../config/queues/transcode'

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

  const tmpDir = await fs.mkdtemp('/tmp/tidal-')

  function childJobs(parentJobId: string): FlowJob[] {
    return filteredPresets.map((preset: Preset) => {
      const jobData: FFmpegJobData = {
        tmpDir,
        cmd: preset.cmd,
        input: value.input,
        parentId: parentJobId,
        webhooks: value.webhooks,
      }
      const job: FlowJob = {
        data: jobData,
        name: 'ffmpeg',
        queueName: 'transcode',
      }
      return job
    })
  }

  const parentJobId: string = uuidv4()

  const outputJobData: OutputJobData = {
    tmpDir,
    output: value.output,
  }

  const packageJobData: PackageJobData = {
    tmpDir,
    package_cmds: pacakageCommands,
  }

  const job = {
    name: 'output',
    data: outputJobData,
    queueName: 'transcode',
    children: [
      {
        name: 'package',
        data: packageJobData,
        queueName: 'transcode',
        children: childJobs(parentJobId),
      },
    ],
    opts: { jobId: parentJobId, priority: 1 },
  }
  await transcodeFlowProducer.add(job)
  return res.json(job)
}

export async function ffprobeController(req, res) {
  const schema = Joi.object({
    input: Joi.string().required().max(1024),
  })

  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })

  if (error) return res.status(400).json(error)

  const job = await transcodeQueue.add('probe', value, { priority: 1 })
  if (!job || !job.id) return res.sendStatus(500)

  for (let i = 0; i < 6; i++) {
    i++
    const jobQuery = await transcodeQueue.getJob(job.id)
    if (jobQuery?.progress === 100) return res.json({ metadata: jobQuery.returnvalue })
    await sleep(500)
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function getTranscodeJobs(req, res) {
  return res.json([
    {
      name: 'active',
      jobs: await transcodeQueue.getActive(),
    },
    {
      name: 'completed',
      jobs: await transcodeQueue.getCompleted(),
    },
    {
      name: 'delayed',
      jobs: await transcodeQueue.getDelayed(),
    },
    {
      name: 'failed',
      jobs: await transcodeQueue.getFailed(),
    },
    {
      name: 'waiting',
      jobs: await transcodeQueue.getWaiting(),
    },
    {
      name: 'waitingChildren',
      jobs: await transcodeQueue.getWaitingChildren(),
    },
  ])
}
