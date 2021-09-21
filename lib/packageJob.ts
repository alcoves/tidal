import fs from "fs-extra"
import { Job } from "../types"
import { spawnChild } from "./spawnChild"

export default async function PackageJob(job: Job, tmpDirPath: string): Promise<void> {
  const awsCliCommands = [
    "s3", "cp", `s3://cdn.bken.io/v/${job.video}/progressive/`,
    ".", "--recursive", "--profile", "wasabi", "--endpoint", "https://us-east-2.wasabisys.com"]
  await spawnChild("aws", awsCliCommands, {
    cwd: tmpDirPath,
    env: process.env
  })

  const bento4Commands = [ "-f", "--hls" ]
  const files = await fs.readdir(tmpDirPath)

  if (process.platform === "win32") {
    await spawnChild("cmd", ["/c", "C:\\Windows\\bin\\mp4dash", ...bento4Commands, ...files], {
      cwd: tmpDirPath,
      env: process.env
    })
  } else {
    await spawnChild("mp4dash", [...bento4Commands, ...files], {
      cwd: tmpDirPath,
      env: process.env
    })
  }

  const awsCliCommandsUpload = [
    "s3", "cp", "./output", `s3://cdn.bken.io/v/${job.video}/pkg/`,
    "--recursive", "--profile", "wasabi", "--endpoint", "https://us-east-2.wasabisys.com"]
  await spawnChild("aws", awsCliCommandsUpload, {
    cwd: tmpDirPath,
    env: process.env
  })
}