import { spawnChild } from "./spawnChild"
import { Job } from "../types"

export default async function ThumbnailJob(job: Job, tmpDirPath: string): Promise<void> {
  await spawnChild("ffmpeg", job.ffmpegCommand.split(" "), {
    cwd: tmpDirPath,
    env: process.env
  })
  const awsCliCommandsUpload = [
    "s3", "cp", "./thumb.jpg", `s3://cdn.bken.io/v/${job.video}/thumb.jpg`,
    "--profile", "wasabi", "--endpoint", "https://us-east-2.wasabisys.com"]
  await spawnChild("aws", awsCliCommandsUpload, {
    cwd: tmpDirPath,
    env: process.env
  })
}