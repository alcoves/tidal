import path from 'path'
import chalk from 'chalk'
import fs from 'fs-extra'

import { ffmpeg } from '../lib/ffmpeg'
import { TranscodeJob } from '../types'
import s3, { s3URI, uploadDir } from '../lib/s3'

export async function transcodeJob(job: TranscodeJob) {
  console.info(chalk.blue('creating temporary directory'))
  const tmpDir = await fs.mkdtemp('/tmp/tidal-transcode-')

  const filename = path.basename(job.data.s3OutputUri)
  const { Bucket, Key } = s3URI(job.data.s3OutputUri)

  try {
    await ffmpeg(`-i ${job.data.input} ${job.data.cmd} ${filename}`, {
      cwd: tmpDir,
    })

    if (filename.includes('.m3u8')) {
      console.info(chalk.blue('uploading hls directory to remote'))
      const hlsUploadUri = path.dirname(s3URI(job.data.s3OutputUri).Key)
      await uploadDir(tmpDir, hlsUploadUri, s3URI(job.data.s3OutputUri).Bucket)
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
