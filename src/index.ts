import dotenv from 'dotenv'
dotenv.config()

import './config/queues'
import './config/webhooks'

import app from './app'
import chalk from 'chalk'

const port = process.env.API_PORT || 5000

app.listen(port, () => {
  console.log(chalk.green.bold(`listening on *:${port}`))
  console.log(chalk.green.bold(`Redis URL: ${process.env.REDIS_HOST}`))
})
