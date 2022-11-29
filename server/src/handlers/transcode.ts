import path from 'path'
import chalk from 'chalk'
import fs from 'fs-extra'

import { ffmpeg } from '../lib/ffmpeg'
import { TranscodeJob } from '../types'
import s3, { parseS3Uri, uploadDir } from '../lib/s3'

export async function transcodeJob(job: TranscodeJob) {
  console.info(chalk.blue('creating temporary directory'))
  const tmpDir = await fs.mkdtemp('/tmp/tidal-transcode-')

  const filename = path.basename(job.data.location)
  const { Bucket, Key } = parseS3Uri(job.data.location)

  try {
    await ffmpeg(`-i ${job.data.input} ${job.data.cmd} ${filename}`, {
      cwd: tmpDir,
    })

    if (filename.includes('.m3u8')) {
      console.info(chalk.blue('uploading hls directory to remote'))
      const hlsUploadUri = path.dirname(parseS3Uri(job.data.location).Key)
      await uploadDir(tmpDir, hlsUploadUri, parseS3Uri(job.data.location).Bucket)
    } else {
      console.info(chalk.blue('uploading single output to remote'))
      await s3
        .upload({
          Key,
          Bucket,
          Body: fs.createReadStream(`${tmpDir}/${filename}`),
        })
        .promise()
    }
  } catch (error) {
    console.error(chalk.red(error))
    throw error
  } finally {
    await job.updateProgress(100)
    console.info(chalk.blue(`removing ${tmpDir}`))
    await fs.remove(tmpDir)
  }
}
