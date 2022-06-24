import { createClient } from 'redis'

const port = process.env.REDIS_PORT
const host = process.env.REDIS_HOST
const password = process.env.REDIS_PASSWORD

export const db = createClient({
  url: `redis://default:${password}@${host}:${port}`,
})

db.connect()
db.on('connect', async () => {
  console.log('Connected to Redis')
})
db.on('error', err => console.log('Redis Client Error', err))
