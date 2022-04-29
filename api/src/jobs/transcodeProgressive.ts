import fs from 'fs-extra'
import ffmpeg from 'fluent-ffmpeg'
import { Job } from 'bullmq'
import { uploadFile } from '../config/s3'
import { Progress, TranscodeProgressiveJobData } from '../types'
import path from 'path'

export async function transcodeProgressive(job: Job) {
  const { input, output, cmd }: TranscodeProgressiveJobData = job.data

  let lastProgress = 0
  const tmpDir = await fs.mkdtemp('/tmp/bken-transcode-progressive-')
  const tmpOutput = `${tmpDir}/output${path.extname(output)}`

  try {
    return new Promise((resolve, reject) => {
      ffmpeg(input)
        .outputOptions(cmd.split(' '))
        .output(tmpOutput)
        .on('start', function (commandLine) {
          console.log('Spawned ffmpeg with command: ' + commandLine)
        })
        .on('progress', async function (progress: Progress) {
          if (progress.percent >= 0) {
            const currentProgress = Math.ceil(progress.percent)
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
          if (output.includes('s3://')) {
            console.log(`Uploading to ${output}`)
            const [Bucket, Key] = output.split('s3://')[1].split('/')
            await uploadFile(tmpOutput, { Bucket, Key })
          } else {
            console.log(`Copying ${tmpOutput} to ${output}`)
            await fs.copy(tmpOutput, output)
          }

          await fs.remove(tmpDir)
          console.log('Done')
          resolve('done')
        })
        .run()
    })
  } catch (error) {
    console.error(error)
    await fs.remove(tmpDir)
    throw error
  }
}
