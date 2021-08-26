import fs from "fs-extra"
import ffmpeg from "./ffmpeg"
import { copy } from "../config/s3"
import { x264 } from "./ffCommands"
import { getPresets } from "./getPresets"
import { getMetadata } from "./getMetadata"

export default async function transcode (input: string) {
  // TODO :: Should abstract this into a configurable object
  const destinationParams = {
    Bucket: "cdn.bken.io",
    Key: "tests/360p-30fps-small/pkg"
  }

  console.log("Creating temoporary directory")
  const tmpDir = await fs.mkdtemp("/tmp/tidal-")
  console.log("TMPDIR", tmpDir)

  try {
    // TODO console.log('Writing entry to database')
    // Database abstraction that updates the record manually

    console.log("Fetching metadata")
    const metadata = await getMetadata(input)
    console.log("METADATA", metadata)

    console.log("Fetching video presets")
    const presets = getPresets(metadata)
    console.log("PRESETS", presets)

    console.log("Generating ffmpeg arguments")
    const x264Commands = x264(metadata, presets)
    console.log("FFARGS", x264Commands)

    console.log("Transcoding video")
    await ffmpeg(
      input,
      tmpDir,
      x264Commands
    )

    console.log("Syncing assets to CDN")
    await copy(tmpDir, destinationParams)
  } catch (error) {
    console.error("An error occured", error)
    // write error to consul
  } finally {
    console.log("Removing temporary directory", tmpDir)
    await fs.remove(tmpDir)
  }
}
