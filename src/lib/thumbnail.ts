import fs from "fs-extra"
import { ffThumb } from "./ffmpeg"
import { copy } from "../config/s3"
import { dispatch, TidalEvent } from "./webhook"
import getThumbnailArgs from "./getThumbnailArgs"

export default async function thumbnail (video_id: string, input: string) {
  const destinationParams = {
    Bucket: "cdn.bken.io",
    Key: `v/${video_id}`
  }

  console.log("Creating temoporary directory")
  const tmpDir = await fs.mkdtemp("/tmp/tidal-")
  console.log("TMPDIR", tmpDir)

  try {
    // TODO console.log('Writing entry to database')
    const thumabnailArgs = await getThumbnailArgs()
    console.log("thumabnailArgs", thumabnailArgs)

    const thumbnailName = "thumb.jpg"

    console.log("Creating thumbnail")
    await ffThumb(
      input,
      tmpDir,
      thumabnailArgs,
      thumbnailName
    )

    console.log("Syncing assets to CDN")
    await copy(tmpDir, destinationParams)

    console.log("Dispatching webhook")
    await dispatch({
      event: TidalEvent.video_asset_thumbnail_ready,
      data: {
        id: video_id,
        thumbnail_url: `https://cdn.bken.io/v/${video_id}/${thumbnailName}`
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
