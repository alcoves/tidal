import axios from 'axios'
import { Job } from 'bullmq'
import { db } from '../utils/redis'
import { TidalSettings, TidalWebhookBody } from '../types'

export async function webhookJob(job: Job) {
  const settings: TidalSettings = JSON.parse((await db.get('tidal:settings')) || '')

  if (!settings.webhookUrl) {
    throw new Error(`Invalid webhook URL: ${settings.webhookUrl}`)
  }
  if (!settings.apiKey) {
    throw new Error(`Invalid API_KEY`)
  }

  const webhookJob: TidalWebhookBody = job.data
  const res = await axios({
    method: 'POST',
    data: webhookJob,
    url: settings.webhookUrl,
    headers: { 'x-api-key': settings.apiKey },
  })

  return {
    data: res.data,
    status: res.status,
  }
}
