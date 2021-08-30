import fs from "fs-extra"
import db from "../db/index"
import ffmpeg from "./ffmpeg"
import { copy } from "../config/s3"
import { x264 } from "./ffCommands"
import { getPresets } from "./getPresets"
import { getMetadata } from "./getMetadata"

export default async function transcode (input: string, video_id: string, user_id: string) {
  console.log("Creating temoporary directory")
  const tmpDir = await fs.mkdtemp("/tmp/tidal-")
  console.log("TMPDIR", tmpDir)

  try {
    console.log("Fetching metadata")
    const metadata = await getMetadata(input)
    console.log("METADATA", metadata)

    const videoSetRes = await db.query(`insert into videos (
      id,
      status,
      title,
      duration,
      views,
      visibility,
      percent_completed,
      user_id)
    values($1, $2, $3, $4, $5, $6, $7, $8)
    on conflict (id)
    do update set
      status            = $2,
      percent_completed = $7
      `,
    [
      video_id,
      "encoding",
      "Video title",
      metadata.video.duration,
      0,
      "unlisted",
      0,
      user_id
    ]
    )
    console.log("videoSetRes", videoSetRes)

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

    console.log("Writing updates to database")
    await db.query(
      `update videos
       set status            = $2,
           percent_completed = $3,
           mpd_link          = $4
       where id = $1`,
      [
        video_id,
        "completed",
        100,
        `https://cdn.bken.io/v/${video_id}/pkg/manifest.mpd`,
      ]
    )
  } catch (error) {
    console.error("An error occured", error)
    await db.query( "update videos set status = $2, where id = $1", [ video_id, "error", ] )
  } finally {
    console.log("Removing temporary directory", tmpDir)
    await fs.remove(tmpDir)
  }
}
