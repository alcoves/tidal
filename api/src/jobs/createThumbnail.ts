import path from 'path'
import fs from 'fs-extra'
import mime from 'mime-types'
import ffmpeg from 'fluent-ffmpeg'
import { Job } from 'bullmq'
import { purgeURL } from '../utils/bunny'
import { getSettings } from '../utils/redis'
import { getS3Config, getSignedURL } from '../config/s3'
import { Progress, ThumbnailJobData } from '../types'

export async function createThumbnail(job: Job): Promise<any> {
  const { input, output }: ThumbnailJobData = job.data

  const filename = path.basename(output.key)
  const tmpDir = await fs.mkdtemp('/tmp/bken-')
  const ffOutputPath = `${tmpDir}/${filename}`

  const ffmpegCommands = [
    '-vf',
    'scale=854:480:force_original_aspect_ratio=increase,crop=854:480',
    '-vframes',
    '1',
    '-q:v',
    '4',
    '-f',
    'image2',
  ]

  try {
    const signedUrl = await getSignedURL({ Bucket: input.bucket, Key: input.key })
    const settings = await getSettings()

    return new Promise((resolve, reject) => {
      ffmpeg(signedUrl)
        .outputOptions(ffmpegCommands)
        .output(ffOutputPath)
        .on('start', function (commandLine) {
          console.log('Spawned ffmpeg with command: ' + commandLine)
        })
        .on('progress', async function (progress: Progress) {
          if (progress.percent >= 0) {
            await job.updateProgress(progress.percent)
          }
        })
        .on('error', function (err) {
          console.log('An error occurred: ' + err.message)
          reject(err.message)
        })
        .on('end', async function () {
          try {
            const s3 = await getS3Config()
            await s3.upload({
              Key: output.key,
              Bucket: output.bucket,
              ContentType: mime.lookup(filename),
              Body: fs.createReadStream(ffOutputPath),
            })

            await fs.remove(tmpDir)
            if (settings.cdnHostname && settings.bunnyAccessKey) {
              await purgeURL(`${settings.cdnHostname}/${output.key}`, settings.bunnyAccessKey)
            }

            resolve({ thumbnailFilename: filename })
          } catch (error) {
            console.error('Failure in createThumbnail on end', error)
            await fs.remove(tmpDir)
            reject(error)
          }
        })
        .run()
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}
