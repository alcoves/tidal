import fs from "fs-extra"
// import ffmpeg from './ffmpeg'
import rclone, { rcloneGetLink } from "./rclone"

interface ThumbnailEvent {
  rcloneSourceUri: string
  rcloneDestinationUri: string
}

export default async function transcode (event: ThumbnailEvent) {
  console.log("Creating temoporary directory")
  const tmpDir = await fs.mkdtemp("/tmp/tidal-")
  console.log("TMPDIR", tmpDir)

  try {
    // TODO console.log('Writing entry to database')
    console.log("Getting signed source file url")
    const signedSourceUri = await rcloneGetLink(event.rcloneSourceUri)
    console.log("SIGNEDSOURCEURI", signedSourceUri)

    // const thumabnailArgs = await getThumbnailArgs()
    // console.log('thumabnailArgs', thumabnailArgs)

    console.log("Creating thumbnail")
    // await ffmpeg(
    //   signedSourceUri,
    //   tmpDir
    //   thumabnailArgs
    // )

    console.log("Syncing assets to CDN")
    await rclone("copy", [tmpDir, event.rcloneDestinationUri, "-P"])
  } catch (error) {
    console.error("An error occured", error)
    // write error to consul
  } finally {
    console.log("Removing temporary directory", tmpDir)
    await fs.remove(tmpDir)
  }
}
