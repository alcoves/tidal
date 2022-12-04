import chalk from 'chalk'
import fs from 'fs-extra'

import { ffmpeg } from '../lib/ffmpeg'
import { TranscodeJob } from '../types'
import s3, { parseS3Uri } from '../lib/s3'

export async function transcodeJob(job: TranscodeJob) {
  await job.updateProgress(1)
  console.info(chalk.blue('creating temporary directory'))
  const tmpDir = await fs.mkdtemp('/tmp/tidal-transcode-')
  const fileOutputPath = `${tmpDir}/output.mkv`

  const sourceLink = await s3.getSignedUrlPromise('getObject', {
    Key: parseS3Uri(job.data.input).Key,
    Bucket: parseS3Uri(job.data.input).Bucket,
  })

  const codecArgs = `-c:v libsvtav1 -crf 40 -preset 8 -c:a libopus -ac 2 -b:a 128k`
  const resolutionArgs = `-filter:v scale='min(1280,iw)':min'(720,ih)':force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2`
  const command = `${codecArgs} ${resolutionArgs} ${fileOutputPath}`

  try {
    console.info(chalk.blue('running ffmpeg'))
    await ffmpeg(`-i ${sourceLink} ${command}`)

    console.info(chalk.blue('uploading hls directory to remote'))
    await s3
      .upload({
        Key: parseS3Uri(job.data.output).Key,
        Bucket: parseS3Uri(job.data.output).Bucket,
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
