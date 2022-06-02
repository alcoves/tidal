import { Job } from 'bullmq'
import { getTidalQueue } from './queues'
import { TidalWebhookBody } from '../types'

export async function enqueueWebhook(job: Job) {
  const webhookBody: TidalWebhookBody = {
    id: job.id,
    name: job.name,
    data: job.data,
    queueName: job.name,
    progress: job.progress,
    returnValue: job.returnvalue,
    isFailed: await job.isFailed(),
  }
  await getTidalQueue('webhooks')?.queue?.add('dispatch', webhookBody)
}
