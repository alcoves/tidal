import { ConnectionOptions } from 'bullmq'

export const connection: ConnectionOptions = {
  password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
}
