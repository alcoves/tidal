import fs from "fs-extra"
import { Job } from "./types"
import { spawnChild } from "./spawnChild"

const isWin = process.platform === "win32"

export default async function TranscodeJob(job: Job, tmpDirPath: string) {
  await spawnChild("ffmpeg", job.ffmpegCommand.split(" "), {
    cwd: tmpDirPath,
    env: process.env
  })

  const bento4Commands = ["--fragment-duration", "4"]
  const files = await fs.readdir(tmpDirPath)

  for (const file of files) {
    const tmpFileName = `tmp-${file}`
    if (isWin) {
      await spawnChild("cmd", ["/c", "C:\\Windows\\bin\\mp4fragment", ...bento4Commands, file, tmpFileName], {
        cwd: tmpDirPath,
        env: process.env
      })
    } else {
      await spawnChild("mp4fragment", [file, ...bento4Commands, file, tmpFileName], {
        cwd: tmpDirPath,
        env: process.env
      })
    }
    await fs.move(`${tmpDirPath}/${tmpFileName}`, `${tmpDirPath}/${file}`, { overwrite: true })
  }

  const awsCliCommands = ["s3", "cp", ".", `s3://cdn.bken.io/v/${job.video}/progressive`, "--recursive", "--profile", "wasabi", "--endpoint", "https://us-east-2.wasabisys.com"]
  await spawnChild("aws", awsCliCommands, {
    cwd: tmpDirPath,
    env: process.env
  })
}