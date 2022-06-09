import Joi from 'joi'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../utils/redis'

export async function queryWorkflows() {
  const keys = await db.keys('tidal:workflows:*')
  const dbRes = await Promise.all(keys.map(k => db.get(k) || ''))
  return dbRes.map(r => {
    if (r) return JSON.parse(r)
  })
}

export async function listWorkflows(req, res) {
  const workflows = await queryWorkflows()
  return res.status(200).json({ workflows })
}

export async function startWorkflow(req, res) {
  // Get the tree
  // Get the presets
  // Turn presets into Jobs
  // Enqueue the jobs
  return res.send('done')
}

export async function createWorkflow(req, res) {
  const schema = Joi.object({
    id: Joi.string()
      .max(36)
      .default(() => uuidv4()),
    name: Joi.string().max(512).default('New Workflow'),
    presets: Joi.array().items(Joi.string()).default([]),
    webhookURL: Joi.string().uri().default('').allow(''),
    chunked: Joi.boolean().default(false),
  })

  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })
  if (error) return res.status(400).json(error)
  await db.set(`tidal:workflows:${value.id}`, JSON.stringify(value))
  return res.sendStatus(200)
}

export async function updateWorkflow(req, res) {
  const { workflowId } = req.params

  const schema = Joi.object({
    chunked: Joi.boolean().default(false),
    webhookURL: Joi.string().uri().default('').allow(''),
    name: Joi.string().default('New Workflow').max(512),
    presets: Joi.array().items(Joi.string()).default([]),
  })
  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })
  if (error) return res.status(400).json(error)

  const workflow = (await db.get(`tidal:workflows:${workflowId}`)) || ''
  const update = { ...JSON.parse(workflow), ...value }
  const updatedWorkflow = await db.set(`tidal:workflows:${workflowId}`, JSON.stringify(update))
  return res.status(200).json(updatedWorkflow)
}

export async function deleteWorkflow(req, res) {
  const { workflowId } = req.params
  await db.del(`tidal:workflows:${workflowId}`)
  return res.sendStatus(200)
}
