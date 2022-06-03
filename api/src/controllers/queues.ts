import Joi from 'joi'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../utils/redis'
import { queues } from '../config/queues'

// modify
export async function cleanQueues(req, res) {
  // const queues = await queues()
  // await Promise.all(
  //   queues.map(async ({ name }) => {
  //     // const queue =
  //     // await queue.clean(1, 1000, 'failed')
  //     // await queue.clean(1, 1000, 'failed')
  //     // await queue.clean(1, 1000, 'completed')
  //     // await queue.clean(1, 1000, 'completed')
  //   })
  // )
  // return res.sendStatus(200)
}

// backfill with data from bullmq
export async function listQueues(req, res) {
  return res.status(200).json({ queues: JSON.parse(JSON.stringify(queues)) })
}

export async function deleteQueue(req, res) {
  const { queueId } = req.params
  await db.del(`tidal:queues:${queueId}`)
  return res.sendStatus(200)
}

export async function createQueue(req, res) {
  const schema = Joi.object({
    name: Joi.string().required().max(64),
  })
  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })
  if (error) return res.status(400).json(error)
  await db.set(`tidal:queues:${value.name}`, JSON.stringify(value))
  return res.sendStatus(202)
}
