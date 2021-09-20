import fs from "fs-extra"
import path from "path"
import { spawnChild } from "./spawnChild"
interface Job {
  _id: string
  commands: string[]
}

const isWin = process.platform === "win32"

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

      if (binary === "mp4hls" && isWin) {
        const files = await fs.readdir(tmpDirPath)
        await spawnChild("cmd", ["/c", "C:\\Windows\\bin\\mp4hls.bat", ...files], {
          cwd: tmpDirPath,
          env: process.env
        })
      } else {
        await spawnChild(binary, args, {
          cwd: tmpDirPath,
          env: process.env
        })
      }
    }
  } catch (error) {
    console.error("Error in step, writing error to api and exiting", error)
    // TODO :: Write error to api
    throw new Error(error)
  } finally {
    await fs.remove(tmpDirPath)
  }
}