import dotenv from 'dotenv'
dotenv.config()

import app from './app'
import { queues } from './queues'
import envVars from './config/envVars'

async function main(port: number | string) {
  try {
    app.listen(port, () => {
      console.log(`listening on *:${port}`)
      console.log(`Redis URL: ${envVars.redisHost}`)
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

if (envVars.apiPort) {
  main(parseInt(envVars.apiPort))
} else {
  process.exit(1)
}
