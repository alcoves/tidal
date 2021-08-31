import fs from "fs-extra"
import ffmpeg from "./ffmpeg"
import { copy } from "../config/s3"
import { x264 } from "./ffCommands"
import { getPresets } from "./getPresets"
import { getMetadata } from "./getMetadata"
import { dispatch, TidalEvent } from "./webhook"

export default async function transcode (input: string, video_id: string) {
  console.log("Creating temoporary directory")
  const tmpDir = await fs.mkdtemp("/tmp/tidal-")
  console.log("TMPDIR", tmpDir)

  try {
    await dispatch({ 
      event: TidalEvent.video_asset_ready,
      data: {
        id: video_id,
        status: "started",
        percent_completed: 0,
      }
    })

    console.log("Fetching metadata")
    const metadata = await getMetadata(input)
    console.log("METADATA", metadata)

    const destinationParams = {
      Bucket: "cdn.bken.io",
      Key: `v/${video_id}/pkg`
    }  

    console.log("Fetching video presets")
    const presets = getPresets(metadata)
    console.log("PRESETS", presets)

    console.log("Generating ffmpeg arguments")
    const x264Commands = x264(metadata, presets)
    console.log("FFARGS", x264Commands)

    console.log("Transcoding video")
    // TODO :: Update percent completed
    await ffmpeg(
      input,
      video_id,
      tmpDir,
      x264Commands
    )

    console.log("Syncing assets to CDN")
    await copy(tmpDir, destinationParams)

    console.log("Dispatching Complete Webhook")
    await dispatch({ 
      event: TidalEvent.video_asset_ready,
      data: {
        id: video_id,
        status: "completed",
        percent_completed: 100,
        mpd_link: `https://cdn.bken.io/v/${video_id}/pkg/manifest.mpd`,
      }
    })
  } catch (error) {
    console.error("An error occured", error)
    // TODO :: webhook error message
  } finally {
    console.log("Removing temporary directory", tmpDir)
    await fs.remove(tmpDir)
  }
}
