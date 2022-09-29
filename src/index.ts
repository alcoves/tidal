import dotenv from 'dotenv'
dotenv.config()

import { db } from './config/db'
import { adaptiveTranscode, metadata, thumbnail, webhooks } from './queues/queues'

import app from './app'
import chalk from 'chalk'

async function main(port: number) {
  const _metadataQueue = metadata.queue
  const _metadataWorker = metadata.worker

  const _thumbnailQueue = thumbnail.queue
  const _thumbnailWorker = thumbnail.worker

  const _adaptiveTranscodeQueue = adaptiveTranscode.queue
  const _adaptiveTranscodeWorker = adaptiveTranscode.worker

  const _webhooksQueue = webhooks.queue
  const _webhooksWorker = webhooks.worker

  try {
    app.listen(port, () => {
      console.log(chalk.green.bold(`listening on *:${port}`))
      console.log(chalk.green.bold(`Redis URL: ${process.env.REDIS_HOST}`))
    })
  } catch (error) {
    await db.$disconnect()

    await _metadataQueue.close()
    await _metadataWorker.close()

    await _thumbnailQueue.close()
    await _thumbnailWorker.close()

    await _adaptiveTranscodeQueue.close()
    await _adaptiveTranscodeWorker.close()

    await _webhooksQueue.close()
    await _webhooksWorker.close()

    console.log(chalk.red.bold(`Error: ${error}`))
    process.exit()
  } finally {
    await db.$disconnect()
  }
}

main(parseInt(process.env.API_PORT || '5000'))
