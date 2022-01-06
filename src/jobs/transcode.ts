import ffmpeg from 'fluent-ffmpeg'
import { Job } from 'bullmq'
import { Progress, TranscodeJobData } from '../types'
import { generateFfmpegCommand, shouldProcess } from '../utils/video'

export async function transcode(job: Job) {
  const { input, output }: TranscodeJobData = job.data

  // Make 240p process regardless of weather the video is big enough
  if (job.data.resolution !== '240p') {
    if (await !shouldProcess(input, job.data.resolution)) return 'skipped resolution'
  }

  const ffmpegCommands = generateFfmpegCommand(job.data.resolution)

  try {
    return new Promise((resolve, reject) => {
      ffmpeg(input)
        .outputOptions(ffmpegCommands)
        .output(output)
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
          resolve('done')
        })
        .run()
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}
