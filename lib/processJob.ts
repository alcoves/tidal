import dotenv from "dotenv"
dotenv.config()

import path from "path"
import axios from "axios"
import fs from "fs-extra"
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

    await axios.patch(`${process.env.API_ENDPOINT}/jobs/${job._id}`, {
      status: "completed"
    }, { headers: { "X-API-Key": process.env.TIDAL_API_KEY } })
  } catch (error) {
    console.error(error)
    await axios.patch(`${process.env.API_ENDPOINT}/jobs/${job._id}`, {
      status: "error"
    }, { headers: { "X-API-Key": process.env.TIDAL_API_KEY } })
    throw new Error(error)
  } finally {
    await fs.remove(tmpDirPath)
  }
}