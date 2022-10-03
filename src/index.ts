import dotenv from 'dotenv'
dotenv.config()

import app from './app'
import chalk from 'chalk'
import queues from './queues/queues'

import { db } from './config/db'

async function main(port: number) {
  try {
    app.listen(port, () => {
      console.log(chalk.green.bold(`listening on *:${port}`))
      console.log(chalk.green.bold(`Redis URL: ${process.env.REDIS_HOST}`))
    })
  } catch (error) {
    await db.$disconnect()

    for (const { queue, worker } of Object.values(queues)) {
      await queue.close()
      await worker.close()
    }

    console.log(chalk.red.bold(`Error: ${error}`))
    process.exit()
  } finally {
    await db.$disconnect()
  }
}

main(parseInt(process.env.API_PORT || '5000'))
