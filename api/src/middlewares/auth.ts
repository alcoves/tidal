import { db } from '../utils/redis'
import { TidalSettings } from '../types'

export async function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key']
  const settings: TidalSettings = JSON.parse((await db.get('tidal:settings')) || '')
  if (apiKey !== settings.apiKey) return res.sendStatus(403)
  next()
}
