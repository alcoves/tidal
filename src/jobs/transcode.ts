import fs from 'fs-extra'
import ffmpeg from 'fluent-ffmpeg'
import { Job } from 'bullmq'
import s3, { getSignedURL } from '../config/s3'
import { Progress, TranscodeJobData } from '../types'

export async function transcode(job: Job) {
  const { input, output }: TranscodeJobData = job.data

  const filename = 'optimized.mp4'
  const tmpDir = await fs.mkdtemp('/tmp/bken-')
  const ffOutputPath = `${tmpDir}/${filename}`

  const ffmpegCommands = ['-c:v', 'libx264', '-crf', '24']

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
          console.log('Done')
          s3.upload({
            Key: output.key,
            Bucket: output.bucket,
            ContentType: 'video/h264',
            Body: fs.createReadStream(ffOutputPath),
          })
            .promise()
            .then(async () => {
              fs.removeSync(tmpDir)
              await job.updateProgress(100)
              resolve('done')
            })
            .catch(() => {
              fs.removeSync(tmpDir)
              console.error('Failed to upload')
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
