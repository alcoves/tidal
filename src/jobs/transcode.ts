import fs from 'fs-extra'
import ffmpeg from 'fluent-ffmpeg'
import { Job } from 'bullmq'

interface Progress {
  frames: number
  percent: number
  timemark: string
  currentFps: number
  targetSize: number
  currentKbps: number
}

export async function transcode(job: Job) {
  console.log('Running Job', job.data)
  const { input, output, ffmpeg_command } = job.data

  try {
    return new Promise((resolve, reject) => {
      ffmpeg(input)
        .outputOptions(ffmpeg_command.split(' '))
        .output(output)
        .on('start', function (commandLine) {
          console.log('Spawned Ffmpeg with command: ' + commandLine)
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
          // s3.upload({
          //   ...uploadParams,
          //   ContentType: 'video/h264',
          //   Body: fs.createReadStream(tmpFilePath),
          // })
          //   .promise()
          //   .then(() => {
          //     fs.removeSync(tmpDir)
          //     resolve()
          //   })
          //   .catch(() => {
          //     fs.removeSync(tmpDir)
          //     console.error('Failed to upload')
          //     reject()
          //   })
          resolve('done')
        })
        .run()
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}
