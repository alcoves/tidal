import path from 'path'
import chalk from 'chalk'
import fs from 'fs-extra'

import { ffmpeg } from '../lib/ffmpeg'
import s3, { s3URI } from '../lib/s3'
import { TranscodeJob } from '../types'

export async function transcodeJob(job: TranscodeJob) {
  console.info(chalk.blue('creating temporary directory'))
  const tmpDir = await fs.mkdtemp('/tmp/tidal-transcode-')

  const s3OutputUri = 's3://tidal/test/out.mp4'
  const filename = path.basename(s3OutputUri)
  const { Bucket, Key } = s3URI(s3OutputUri)

  try {
    await ffmpeg(`-i ${job.data.input} ${job.data.cmd} ${filename}`, {
      cwd: tmpDir,
    })

    await s3
      .upload({
        Key,
        Bucket,
        Body: fs.createReadStream(`${tmpDir}/${filename}`),
      })
      .promise()
  } catch (error) {
    console.error(chalk.red(error))
    throw error
  } finally {
    await job.updateProgress(100)
    console.info(chalk.blue(`removing ${tmpDir}`))
    await fs.remove(tmpDir)
  }
}
