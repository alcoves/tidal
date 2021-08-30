import fs from "fs-extra"
import db from "../db/index"
import { ffThumb } from "./ffmpeg"
import { copy } from "../config/s3"
import getThumbnailArgs from "./getThumbnailArgs"

export default async function thumbnail (id: string, input: string) {
  const destinationParams = {
    Bucket: "cdn.bken.io",
    Key: `v/${id}`
  }

  console.log("Creating temoporary directory")
  const tmpDir = await fs.mkdtemp("/tmp/tidal-")
  console.log("TMPDIR", tmpDir)

  try {
    // TODO console.log('Writing entry to database')
    const thumabnailArgs = await getThumbnailArgs()
    console.log("thumabnailArgs", thumabnailArgs)

    console.log("Creating thumbnail")
    await ffThumb(
      input,
      tmpDir,
      thumabnailArgs
    )

    console.log("Syncing assets to CDN")
    await copy(tmpDir, destinationParams)

    console.log("Updating database with thumbnail URL")
    const data = await db.query(
      "update videos set thumbnail = $1 where id = $2",
      [`https://cdn.bken.io/v/${id}/thumb.webp`, id])
    console.log("Database Result", data)
  } catch (error) {
    console.error("An error occured", error)
    // write error to consul
  } finally {
    console.log("Removing temporary directory", tmpDir)
    await fs.remove(tmpDir)
  }
}
