import axios from 'axios'
import { WebhookJob } from '../types'

export async function webhookJob(job: WebhookJob) {
  try {
    const apiKey = process.env.API_KEY
    const webhookUrl = process.env.WEBHOOK_URL

    if (!apiKey) throw new Error(`invalid API_KEY`)
    if (!webhookUrl) throw new Error(`invalid webhook URL: ${webhookUrl}`)

    const res = await axios({
      method: 'post',
      data: job.data,
      url: webhookUrl,
      headers: { 'x-api-key': apiKey },
    })

    return { data: res.data, status: res.status }
  } catch (error) {
    console.error('failed to delivery webhook')
    if (process.env.NODE_ENV === 'production') throw error
  }
}
