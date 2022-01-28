import dotenv from 'dotenv'
dotenv.config()

import './config/queues/metadata'
import './config/queues/thumbnail'
import './config/queues/transcode'

import app from './app'

const port = 5000

app.listen(port, () => {
  console.log(`listening on *:${port}`)
  console.log(`Redis URL: ${process.env.REDIS_HOST}`)
  console.log(`Webhook URL: ${process.env.WEBHOOK_URL}`)
})
