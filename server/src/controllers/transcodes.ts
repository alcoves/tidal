import Joi from 'joi'
import { v4 as uuid } from 'uuid'
import { queues } from '../queues'

export async function createTranscode(req, res) {
  // const schema = Joi.object({
  //   url: Joi.string().uri(),
  // })
  // const { error, value } = schema.validate(req.body, {
  //   abortEarly: false,
  //   allowUnknown: true,
  //   stripUnknown: true,
  // })
  // if (error) return res.status(400).json(error)
  // const { url } = value

  const jobId = uuid()
  await queues.jobs.queue.add('transcode', { ...req.body }, { jobId })
  const job = await queues.jobs.queue.getJob(jobId)
  return res.json(job)
}
