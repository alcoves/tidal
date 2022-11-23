import chalk from 'chalk'
import { ConnectionOptions } from 'bullmq'

if (!process.env.REDIS_PORT) process.exit(1)
if (!process.env.REDIS_HOST) process.exit(1)
if (!process.env.REDIS_PASSWORD) process.exit(1)

const msg = `Trying to connect to ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
console.log(chalk.blue(msg))

export const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
  port: Number(process.env.REDIS_PORT),
}
