import fs from 'fs-extra'
import ffmpeg from 'fluent-ffmpeg'
import { Job } from 'bullmq'
import { uploadFile } from '../config/s3'
import { Progress, TranscodeProgressiveJobData } from '../types'

export async function transcodeProgressive(job: Job) {
  const { inputURL, output, cmd }: TranscodeProgressiveJobData = job.data

  let lastProgress = 0
  const tmpDir = await fs.mkdtemp('/tmp/bken-transcode-progressive-')
  const outputPath = `${tmpDir}/output.${output.key.split('.').pop()}` // Better way to get file ext?

  try {
    return new Promise((resolve, reject) => {
      ffmpeg(inputURL)
        .outputOptions(cmd.split(' '))
        .output(outputPath)
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
          console.log('Done')
          await uploadFile(outputPath, { Bucket: output.bucket, Key: output.key })
          await fs.remove(tmpDir)
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
