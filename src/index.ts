import dotenv from 'dotenv'
dotenv.config()

import { queue as metadataQueue, worker as metadataWorker } from './queues/metadata'
import { queue as thumbnailQueue, worker as thumbnailWorker } from './queues/thumbnail'
import {
  queue as adaptiveTranscodeQueue,
  worker as adaptiveTranscodeWorker,
} from './queues/adaptiveTranscode'
import { queue as webhooksQueue, worker as webhooksWorker } from './queues/webhooks'

import app from './app'
import chalk from 'chalk'

async function main(port: number) {
  const _metadataQueue = metadataQueue()
  const _metadataWorker = metadataWorker()

  const _thumbnailQueue = thumbnailQueue()
  const _thumbnailWorker = thumbnailWorker()

  const _adaptiveTranscodeQueue = adaptiveTranscodeQueue()
  const _adaptiveTranscodeWorker = adaptiveTranscodeWorker()

  const _webhooksQueue = webhooksQueue()
  const _webhooksWorker = webhooksWorker()

  try {
    app.listen(port, () => {
      console.log(chalk.green.bold(`listening on *:${port}`))
      console.log(chalk.green.bold(`Redis URL: ${process.env.REDIS_HOST}`))
    })
  } catch (error) {
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
  }
}

main(parseInt(process.env.API_PORT || '5000'))
