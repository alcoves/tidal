import Joi from 'joi'
import fs from 'fs-extra'
import { v4 as uuidv4 } from 'uuid'
import { Workflow } from '../types'
import { db } from '../utils/redis'
import { flow } from '../config/queues'

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

export async function getWorkflowById(id: string): Promise<Workflow | null> {
  const workflow = await db.get(`tidal:workflows:${id}`)
  if (workflow) return JSON.parse(workflow)
  return null
}

function addTmpDirToData(obj, data = {}) {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (key === 'data') {
        console.log(`key: ${key}, value: ${obj[key]}`)
        obj[key] = { ...obj[key], ...data }
      }
      return addTmpDirToData(obj[key], data)
    }
  })

  return obj
}

export async function startWorkflow(req, res): Promise<any> {
  const workflow = req.body.flow
  const parentJobId: string = uuidv4()
  workflow.opts = { jobId: parentJobId, priority: 1 }

  const tmpDir = await fs.mkdtemp('/tmp/tidal-')
  addTmpDirToData(workflow, { tmpDir, parentJobId })

  const workflowEnqueue = await flow.add(workflow)
  return res.json(workflowEnqueue)
}

export async function createWorkflow(req, res) {
  const schema = Joi.object({
    id: Joi.string()
      .max(36)
      .default(() => uuidv4()),
    name: Joi.string().max(512).default('New Workflow'),
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
