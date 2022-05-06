import Joi from 'joi'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../utils/redis'

export async function listRenditions(req, res) {
  const keys = await db.keys('tidal:renditions:*')
  const dbRes = await Promise.all(keys.map(k => db.get(k) || ''))

  return res.status(200).json({
    renditions: dbRes.map((r, i) => {
      if (r) {
        return {
          id: keys[i].split(':')[keys[i].split(':').length - 1],
          ...JSON.parse(r),
        }
      }
    }),
  })
}

export async function createRendition(req, res) {
  const schema = Joi.object({
    id: Joi.string()
      .max(36)
      .default(() => uuidv4()),
    name: Joi.string().default('new_rendition').max(512),
    cmd: Joi.string().required().max(8192),
  })

  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })
  if (error) return res.status(400).json(error)
  await db.set(`tidal:renditions:${value.id}`, JSON.stringify(req.body))
  return res.sendStatus(200)
}

export async function updateRendition(req, res) {
  const { renditionId } = req.params

  const schema = Joi.object({
    name: Joi.string().max(512),
    cmd: Joi.string().max(8192),
  })
  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })
  if (error) return res.status(400).json(error)

  const rendition = (await db.get(`tidal:renditions:${renditionId}`)) || ''
  const update = { ...JSON.parse(rendition), ...value }
  const updatedRendition = await db.set(`tidal:renditions:${renditionId}`, JSON.stringify(update))
  return res.status(200).json(updatedRendition)
}

export async function deleteRendition(req, res) {
  const { renditionId } = req.params
  await db.del(`tidal:renditions:${renditionId}`)
  return res.sendStatus(200)
}
