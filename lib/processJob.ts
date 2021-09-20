import fs from "fs-extra"
import path from "path"
import { spawnChild } from "./spawnChild"

interface Job {
  _id: string
  commands: string[]
}

export async function processJob(job: Job): Promise<void> {
  const tmpDirPath = path.normalize(`/tmp/${job._id}`)
  await fs.remove(tmpDirPath)
  await fs.ensureDir(tmpDirPath)

  try {
    console.log(job)
    for (const command of job.commands) {
      const args = command.split(" ")
      const binary = args.shift()
      console.log("Command binary", binary)
      console.log("Command args", args)

      await spawnChild(binary, args, {
        cwd: tmpDirPath,
        env: process.env
      })
    }
  } catch (error) {
    console.error("Error in step, writing error to api and exiting")
    // TODO :: Write error to api
    throw new Error(error)
  } finally {
    await fs.remove(tmpDirPath)
  }
}