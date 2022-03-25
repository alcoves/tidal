import axios from 'axios'
import { Job } from 'bullmq'
import { TidalWebhookBody } from '../types'

const API_KEY = process.env.API_KEY
const WEBHOOK_URL = process.env.WEBHOOK_URL

export async function dispatchWebhook(job: Job) {
  if (!WEBHOOK_URL) {
    throw new Error(`Invalid webhook URL: ${WEBHOOK_URL}`)
  }
  if (!API_KEY) {
    throw new Error(`Invalid API_KEY`)
  }
  const webhookJob: TidalWebhookBody = job.data
  const res = await axios({
    method: 'POST',
    url: WEBHOOK_URL,
    data: webhookJob,
    headers: {
      'x-api-key': API_KEY,
    },
  })

  return {
    data: res.data,
    status: res.status,
  }
}
