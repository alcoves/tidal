import axios, { AxiosResponse } from "axios"

export enum TidalEvent {
  video_asset_ready = "video.asset.ready",
  video_asset_started = "video.asset.started",
  video_asset_updated = "video.asset.updated",
  video_asset_thumbnail_ready = "video.asset.thumbnail.ready"
}

interface TidalVideo {
  id: string
  status?: string
  mpd_link?: string
  hls_link?: string
  thumbnail_url?: string
  percent_completed?: number
}

interface TidalWebhook {
  event: TidalEvent
  data: TidalVideo
}

export async function dispatch(event: TidalWebhook): Promise<AxiosResponse> {
  try {
    const webhookResult = await axios.post(
      process.env.WEBHOOK_DELIVERY_ENDPOINT,
      event,
      { headers: { "X-API-Key": process.env.TIDAL_API_KEY } }
    )
    console.info(`Webhook event: ${event.event} ${event.data.id}`)
    return webhookResult
  } catch(error) {
    console.error(error)
    console.error("Failed to dispatch webhook")
  }
}