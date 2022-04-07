import { metadataQueue } from '../config/queues/metadata'
import { thumbnailQueue } from '../config/queues/thumbnail'
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
      {
        name: thumbnailQueue.name,
        metrics: {
          jobs: await thumbnailQueue.getJobCounts(),
        },
      },
    ],
  })
}
