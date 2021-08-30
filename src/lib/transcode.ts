import fs from "fs-extra"
import db from "../db/index"
import ffmpeg from "./ffmpeg"
import { copy } from "../config/s3"
import { x264 } from "./ffCommands"
import { getPresets } from "./getPresets"
import { getMetadata } from "./getMetadata"

export default async function transcode (input: string) {
  console.log("Creating temoporary directory")
  const tmpDir = await fs.mkdtemp("/tmp/tidal-")
  console.log("TMPDIR", tmpDir)

  try {
    console.log("Fetching metadata")
    const metadata = await getMetadata(input)
    console.log("METADATA", metadata)

    const videoId = input.split("/")[4] // TODO :: REPLACE
    console.log(videoId)

    // const videoId = nanoid()
    // const video = db.query(
    //   "insert into videos(id, status, title, duration, views, visibility, thumbnail, percent_completed, created_at, updated_at, deleted_at, mpd_link, user_id,) values($1, $2)",
    //   []
    // )

    const destinationParams = {
      Bucket: "cdn.bken.io",
      Key: `v/${videoId}/pkg`
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
      tmpDir,
      x264Commands
    )

    console.log("Syncing assets to CDN")
    await copy(tmpDir, destinationParams)

    console.log("Writing updates to database")
    await db.query(
      `update videos
       set status            = $2,
           percent_completed = $3,
           mpd_link          = $4
       where id = $1`,
      [
        videoId,
        "completed",
        100,
        `https://cdn.bken.io/v/${videoId}/pkg/manifest.mpd`,
      ]
    )
  } catch (error) {
    console.error("An error occured", error)
    // Write errors to database
  } finally {
    console.log("Removing temporary directory", tmpDir)
    await fs.remove(tmpDir)
  }
}
