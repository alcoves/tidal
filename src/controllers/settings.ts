import { db } from '../utils/redis'

export async function getSettings(req, res) {
  const settings = await db.get('tidal:settings')
  if (!settings) return res.sendStatus(400)
  return res.json(JSON.parse(settings))
}

export async function setSettings(req, res) {
  await db.set('tidal:settings', JSON.stringify(req.body))
  const newSettings = await db.get('tidal:settings')
  if (!newSettings) return res.sendStatus(400)
  return res.json(JSON.parse(newSettings))
}
