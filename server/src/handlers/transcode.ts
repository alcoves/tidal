import chalk from 'chalk'
import fs from 'fs-extra'
import mime from 'mime'

import { ffmpeg } from '../lib/ffmpeg'
import { TranscodeJob } from '../types'
import s3, { parseS3Uri } from '../lib/s3'

export async function transcodeJob(job: TranscodeJob) {
  await job.updateProgress(1)
  console.info(chalk.blue('creating temporary directory'))
  const tmpDir = await fs.mkdtemp('/tmp/tidal-transcode-')
  const fileOutputPath = `${tmpDir}/${job.data.videoFileId}.${job.data.container}`

  const sourceLink = await s3.getSignedUrlPromise('getObject', {
    Key: parseS3Uri(job.data.input).Key,
    Bucket: parseS3Uri(job.data.input).Bucket,
  })

  try {
    console.info(chalk.blue('running ffmpeg'))
    await ffmpeg(`-i ${sourceLink} ${job.data.cmd} ${fileOutputPath}`)

    console.info(chalk.blue('uploading hls directory to remote'))
    await s3
      .upload({
        Key: parseS3Uri(job.data.output).Key,
        Bucket: parseS3Uri(job.data.output).Bucket,
        Body: fs.createReadStream(fileOutputPath),
        ContentType: mime.getType(fileOutputPath) || '',
      })
      .promise()
  } catch (error) {
    console.error(chalk.red('handler error'))
    console.error(chalk.red(error))
    throw error
  } finally {
    await job.updateProgress(100)
    console.info(chalk.blue(`removing ${tmpDir}`))
    await fs.remove(tmpDir)
  }
}
