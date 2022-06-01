import { metadataQueue } from '../config/queues/metadata'
import { transcodeQueue } from '../config/queues/transcode'
import { webhookQueue } from '../config/queues/webhook'

export async function getQueues(req, res) {
  return res.json({
    queues: [
      {
        name: metadataQueue.name,
        metrics: {
          jobs: await metadataQueue.getJobCounts(),
        },
      },
      {
        name: transcodeQueue.name,
        metrics: {
          jobs: await transcodeQueue.getJobCounts(),
        },
      },
      {
        name: webhookQueue.name,
        metrics: {
          jobs: await webhookQueue.getJobCounts(),
        },
      },
    ],
  })
}

export async function cleanQueues(req, res) {
  await metadataQueue.clean(1, 1000, 'failed')
  await transcodeQueue.clean(1, 1000, 'failed')
  await webhookQueue.clean(1, 1000, 'failed')

  await metadataQueue.clean(1, 1000, 'completed')
  await transcodeQueue.clean(1, 1000, 'completed')
  await webhookQueue.clean(1, 1000, 'completed')

  return res.sendStatus(200)
}
