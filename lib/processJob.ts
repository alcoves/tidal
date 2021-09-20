import fs from "fs-extra"
import path from "path"
import PackageJob from "./packageJob"
import ThumbnailJob from "./thumbnailJob"
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
      await PackageJob(job, tmpDirPath)
      break
    case "thumbnail":
      await ThumbnailJob(job, tmpDirPath)
      break
    default:
      console.log(`Unknown Job : ${job.type}`)
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