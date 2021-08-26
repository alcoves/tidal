import fs from "fs-extra"
import { copy } from "../config/s3"
// import ffmpeg from './ffmpeg'

export default async function thumbnail (input: string) {
  const destinationParams = {
    Bucket: "cdn.bken.io",
    Key: "" // TODO :: Interpolate
  }

  console.log("Creating temoporary directory")
  const tmpDir = await fs.mkdtemp("/tmp/tidal-")
  console.log("TMPDIR", tmpDir)

  try {
    // TODO console.log('Writing entry to database')

    // const thumabnailArgs = await getThumbnailArgs()
    // console.log('thumabnailArgs', thumabnailArgs)

    console.log("Creating thumbnail")
    // await ffmpeg(
    //   signedSourceUri,
    //   tmpDir
    //   thumabnailArgs
    // )

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
