import { getSettings } from '../utils/redis'

export async function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key']
  const settings = await getSettings()
  if (apiKey !== settings.apiKey) return res.sendStatus(403)
  next()
}
