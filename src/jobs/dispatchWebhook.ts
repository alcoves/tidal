import axios from 'axios'
import { Job } from 'bullmq'
import { TidalWebhookBody } from '../types'

const WEBHOOK_URL = process.env.WEBHOOK_URL

export async function dispatchWebhook(job: Job) {
  try {
    if (!WEBHOOK_URL) {
      throw new Error(`Invalid webhook URL: ${WEBHOOK_URL}`)
    }
    const webhookJob: TidalWebhookBody = job.data
    const res = await axios({
      method: 'POST',
      url: WEBHOOK_URL,
      data: webhookJob,
    })

    return {
      data: res.data,
      status: res.status,
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}
