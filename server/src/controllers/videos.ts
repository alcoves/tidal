import Joi from 'joi'
import { v4 as uuid } from 'uuid'
import { queues } from '../lib/bullmq'

export async function createVideo(req, res) {
  const schema = Joi.object({
    url: Joi.string().uri(),
  })
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  })
  if (error) return res.status(400).json(error)

  const { url } = value
  const jobId = uuid()
  await queues.jobs.queue.add('video', { url }, { jobId })
  const job = await queues.jobs.queue.getJob(jobId)
  return res.json(job)
}

export async function getVideo(req, res) {
  const { videoId } = req.params
  const job = await queues.jobs.queue.getJob(videoId)

  if (job) {
    return res.json(job)
  }
  return res.sendStatus(404)
}
