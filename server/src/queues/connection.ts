import chalk from 'chalk'
import { ConnectionOptions } from 'bullmq'

if (!process.env.REDIS_PORT) process.exit(1)
if (!process.env.REDIS_HOST) process.exit(1)
if (!process.env.REDIS_PASSWORD) process.exit(1)

console.log(chalk.blue(`Trying to connect to ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`))

export const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
  port: parseInt(process.env.REDIS_PORT),
}
