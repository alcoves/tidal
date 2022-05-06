import Joi from 'joi'
import { v4 as uuidv4 } from 'uuid'

export function getPresets(req, res) {
  return res.sendStatus(200)
}

export function putPreset(req, res) {
  const schema = Joi.object({
    id: Joi.string()
      .max(36)
      .default(() => uuidv4()),
    name: Joi.string().default('New Preset').max(255),
    renditions: Joi.array().items({
      name: Joi.string().required(),
      cmd: Joi.string().required(),
    }),
    webhookURL: Joi.string().uri(),
    chunked: Joi.boolean().default(false),
  })

  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })

  if (error) return res.status(400).json(error)

  return res.sendStatus(200)
}
