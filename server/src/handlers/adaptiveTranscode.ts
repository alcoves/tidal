import path from 'path'
import chalk from 'chalk'
import fs from 'fs-extra'

import { ffmpeg } from '../lib/ffmpeg'
import { AdaptiveTranscodeJob } from '../types'
import s3, { parseS3Uri, uploadDir } from '../lib/s3'

export async function adaptiveTranscodeJob(job: AdaptiveTranscodeJob) {
  await job.updateProgress(1)
  console.info(chalk.blue('creating temporary directory'))
  const tmpDir = await fs.mkdtemp('/tmp/tidal-transcode-')

  // const filename = path.basename(job.data.location)
  // const { Bucket, Key } = parseS3Uri(job.data.location)

  const command = '-c:v libx264 -crf 26 -preset slow -ac 2 -b:a 128k'

  try {
    // await ffmpeg(`-i ${job.data.input} ${command} playlist.m3u8`, {
    //   cwd: tmpDir,
    // })
    console.info(chalk.blue('uploading hls directory to remote'))
    // const hlsUploadUri = path.dirname(parseS3Uri(job.data.location).Key)
    // await uploadDir(tmpDir, hlsUploadUri, parseS3Uri(job.data.location).Bucket)
  } catch (error) {
    console.error(chalk.red(error))
    throw error
  } finally {
    await job.updateProgress(100)
    console.info(chalk.blue(`removing ${tmpDir}`))
    await fs.remove(tmpDir)
  }
}
