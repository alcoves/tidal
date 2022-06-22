import axios from 'axios'
import { WebhookJob } from '../types'

export async function webhookJob(job: WebhookJob) {
  const apiKey = process.env.API_KEY
  const webhookUrl = process.env.WEBHOOK_URL

  if (!apiKey) throw new Error(`Invalid API_KEY`)
  if (!webhookUrl) throw new Error(`Invalid webhook URL: ${webhookUrl}`)

  const res = await axios({
    method: 'POST',
    data: job.data,
    url: webhookUrl,
    headers: { 'x-api-key': apiKey },
  })

  return { data: res.data, status: res.status }
}
