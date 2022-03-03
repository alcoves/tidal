import fs from 'fs-extra'
import mime from 'mime-types'
import ffmpeg from 'fluent-ffmpeg'
import { Job } from 'bullmq'
import s3, { getSignedURL } from '../config/s3'
import { Progress, ThumbnailJobData } from '../types'
import path from 'path'
import { purgeURL } from '../utils/bunny'

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
        .on('end', function () {
          s3.upload({
            Key: output.key,
            Bucket: output.bucket,
            ContentType: mime.lookup(filename),
            Body: fs.createReadStream(ffOutputPath),
          })
            .promise()
            .then(() => {
              fs.removeSync(tmpDir)
              purgeURL(`https://${process.env.CDN_HOSTNAME}/${output.key}`)
                .then(() => {
                  resolve({ thumbnailFilename: filename })
                })
                .catch(() => {
                  console.error('Failed to purge thumbnail')
                  reject()
                })
            })
            .catch(() => {
              fs.removeSync(tmpDir)
              console.error('Failed to upload thumbnail')
              reject()
            })
        })
        .run()
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}
