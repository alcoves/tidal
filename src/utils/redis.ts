import { createClient } from 'redis'
import { TidalSettings } from '../types'

const port = process.env.REDIS_PORT
const host = process.env.REDIS_HOST
const password = process.env.REDIS_PASSWORD

export const db = createClient({
  url: `redis://default:${password}@${host}:${port}`,
})

export async function getSettings(): Promise<TidalSettings> {
  const tidalSettings = await db.get('tidal:settings')
  if (!tidalSettings) throw new Error('Failed to get tidal settings')
  return JSON.parse(tidalSettings) as TidalSettings
}

db.connect()
db.on('connect', async () => {
  console.log('Connected to Redis')

  try {
    await getSettings()
  } catch (error) {
    console.log('Tidal Settings not found, setting defaults')
    await db.set(
      'tidal:settings',
      JSON.stringify({
        apiKey: 'tidal',
      })
    )
  }
})
db.on('error', err => console.log('Redis Client Error', err))
