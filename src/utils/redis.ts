import { createClient } from 'redis'
import { TidalSettings } from '../types'

const port = process.env.REDIS_PORT
const host = process.env.REDIS_HOST
const password = process.env.REDIS_PASSWORD

export const db = createClient({
  url: `redis://default:${password}@${host}:${port}`,
})

export async function getSettings() {
  const settings: TidalSettings = JSON.parse((await db.get('tidal:settings')) || '')
  return settings
}

db.connect()
db.on('connect', () => console.log('Connected to Redis'))
db.on('error', err => console.log('Redis Client Error', err))
