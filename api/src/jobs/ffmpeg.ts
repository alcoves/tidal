import ffmpeg from 'fluent-ffmpeg'
import { Job } from 'bullmq'
import { getSignedURL } from '../config/s3'
import { Progress, FFmpegJobData } from '../types'

export async function ffmpegJob(job: Job) {
  console.log('Transcode job starting...')
  const { input, cmd, tmpDir }: FFmpegJobData = job.data

  let signedUrl = ''
  let lastProgress = 0

  const ffmpegCommandsSplit = cmd.split(' ')
  const outputFilename = ffmpegCommandsSplit.pop()

  if (input.includes('s3://')) {
    const Bucket = input.split('s3://')[1].split('/')[0]
    const Key = input.split('s3://')[1].split('/')[1]
    signedUrl = await getSignedURL({ Bucket, Key })
  }

  const tmpOutputFilepath = `${tmpDir}/${outputFilename}`

  try {
    return new Promise((resolve, reject) => {
      ffmpeg(signedUrl || input)
        .outputOptions(ffmpegCommandsSplit)
        .output(tmpOutputFilepath)
        .on('start', function (commandLine) {
          console.log('Spawned ffmpeg with command: ' + commandLine)
        })
        .on('progress', async function (progress: Progress) {
          if (progress.percent >= 0) {
            const currentProgress = Math.floor(progress.percent)
            if (lastProgress !== currentProgress) {
              await job.updateProgress(currentProgress)
            }
            lastProgress = Math.ceil(progress.percent)
          }
        })
        .on('error', function (err) {
          console.log('An error occurred: ' + err.message)
          reject(err.message)
        })
        .on('end', async function () {
          await job.updateProgress(100)
          console.log('Done')
          resolve('done')
        })
        .run()
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}
