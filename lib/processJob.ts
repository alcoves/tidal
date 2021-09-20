import fs from "fs-extra"
import path from "path"
// import PackageJob from "./packageJob"
import TranscodeJob from "./transcodeJob"

import { Job } from "./types"

export async function processJob(job: Job): Promise<void> {
  const tmpDirPath = path.normalize(`/tmp/${job._id}`)
  await fs.remove(tmpDirPath)
  await fs.ensureDir(tmpDirPath)

  try {
    console.log(job)
    switch (job.type) {
    case "transcode":
      await TranscodeJob(job, tmpDirPath)
      break
    case "package":
      // await PackageJob(job, tmpDirPath)
      break
    case "thumbnail":
      // aws s3 cp ./thumb.jpg s3://cdn.bken.io/v/${videoId}/thumb.jpg --profile wasabi --endpoint https://us-east-2.wasabisys.com
      break
    default:
      console.log("Unknown job was not processed")
      break
    }
  } catch (error) {
    console.error("Error in step, writing error to api and exiting", error)
    // TODO :: Write error to api
    throw new Error(error)
  } finally {
    await fs.remove(tmpDirPath)
  }
}