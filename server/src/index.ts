import dotenv from 'dotenv'
dotenv.config()

import app from './app'
import { queues } from './queues'

async function main(port: number | string) {
  try {
    app.listen(port, () => {
      console.log(`listening on *:${port}`)
      console.log(`Redis URL: ${process.env.REDIS_HOST}`)
    })
  } catch (error) {
    for (const { queue, worker } of Object.values(queues)) {
      await queue.close()
      await worker.close()
    }
    console.log(`Error: ${error}`)
    process.exit()
  }
}

const API_PORT = process.env.API_PORT

if (API_PORT) {
  main(parseInt(API_PORT))
} else {
  process.exit(1)
}
