import fs from 'fs-extra'
import ffmpeg from 'fluent-ffmpeg'
import { Job } from 'bullmq'
import { uploadFolder } from '../config/s3'
import { Progress, TranscodeHLSJobData } from '../types'
import { generateFfmpegCommand, shouldProcess } from '../utils/video'

export async function transcodeHLS(job: Job) {
  const { inputURL, output }: TranscodeHLSJobData = job.data

  // Make 240p process regardless of weather the video is big enough
  if (job.data.resolution !== '240p') {
    if (await !shouldProcess(inputURL, job.data.resolution)) return 'skipped resolution'
  }

  let lastProgress = 0
  const tmpDir = await fs.mkdtemp('/tmp/bken-transcode')
  const outputPath = `${tmpDir}/stream.m3u8`
  const ffmpegCommands = generateFfmpegCommand(job.data.resolution)

  try {
    return new Promise((resolve, reject) => {
      ffmpeg(inputURL)
        .outputOptions(ffmpegCommands)
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
          await uploadFolder(tmpDir, { Bucket: output.bucket, Key: output.key })
          await fs.remove(tmpDir)
          resolve('done')
        })
        .run()
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}
