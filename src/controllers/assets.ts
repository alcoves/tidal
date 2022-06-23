import Joi from 'joi'
import { v4 as uuidv4 } from 'uuid'
import { getQueueByName } from '../config/queues'
import { ImportAssetData } from '../types'

export async function createAsset(req, res) {
  const schema = Joi.object({
    input: Joi.string().uri().required(),
    output: Joi.string().uri().required(),
  })

  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  })
  if (error) return res.status(400).json(error)

  const importId = uuidv4()
  const importAssetJob: ImportAssetData = {
    id: importId,
    input: value.input,
    output: value.output,
  }

  const importQueue = getQueueByName('import')
  if (importQueue) await importQueue.queue.add('import', importAssetJob)

  return res.json({ id: importId })
}
