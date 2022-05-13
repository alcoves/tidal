import Joi from 'joi'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../utils/redis'

export async function queryPresets() {
  const keys = await db.keys('tidal:presets:*')
  const dbRes = await Promise.all(keys.map(k => db.get(k) || ''))
  return dbRes.map(r => {
    if (r) return JSON.parse(r)
  })
}

export async function getPreset(req, res) {
  const { presetId } = req.params
  const preset = await db.get(`tidal:presets:${presetId}`)
  return res.status(200).json(JSON.parse(preset || ''))
}

export async function listPresets(req, res) {
  const presets = await queryPresets()
  return res.status(200).json({ presets })
}

export async function createPreset(req, res) {
  const schema = Joi.object({
    id: Joi.string()
      .max(36)
      .default(() => uuidv4()),
    name: Joi.string().default('new_preset').max(512),
  })
  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })
  if (error) return res.status(400).json(error)
  await db.set(`tidal:presets:${value.id}`, JSON.stringify(value))
  return res.sendStatus(200)
}

export async function updatePreset(req, res) {
  const { presetId } = req.params

  const schema = Joi.object({
    name: Joi.string().max(512),
    cmd: Joi.string().max(8192),
    constraints: Joi.object({
      width: Joi.number().max(10000),
      height: Joi.number().max(10000),
    }),
  })
  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })
  if (error) return res.status(400).json(error)

  const preset = (await db.get(`tidal:presets:${presetId}`)) || ''
  const update = { ...JSON.parse(preset), ...value }
  const updatedPreset = await db.set(`tidal:presets:${presetId}`, JSON.stringify(update))
  return res.status(200).json(updatedPreset)
}

export async function deletePreset(req, res) {
  const { presetId } = req.params
  await db.del(`tidal:presets:${presetId}`)
  return res.sendStatus(200)
}
