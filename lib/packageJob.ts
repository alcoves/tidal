import fs from "fs-extra"
import { Job } from "./types"
import { spawnChild } from "./spawnChild"

const isWin = process.platform === "win32"

export default async function PackageJob(job: Job, tmpDirPath: string) {


  const bento4Commands = [
    "mp4dash",
    "--hls"
  ]

  if (isWin) {
    const files = await fs.readdir(tmpDirPath)
    await spawnChild("cmd", ["/c", "C:\\Windows\\bin\\mp4hls.bat", ...files, ""], {
      cwd: tmpDirPath,
      env: process.env
    })
  } else {
    await spawnChild("mp4hls", job.ffmpegCommand, {
      cwd: tmpDirPath,
      env: process.env
    })
  }
}