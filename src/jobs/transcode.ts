import fs from 'fs-extra'
import ffmpeg from 'fluent-ffmpeg'
import { Job } from 'bullmq'
import { uploadFolder } from '../config/s3'
import { Progress, TranscodeJobData } from '../types'
import { generateFfmpegCommand, shouldProcess } from '../utils/video'

export async function transcode(job: Job) {
  const { input }: TranscodeJobData = job.data

  // Make 240p process regardless of weather the video is big enough
  if (job.data.resolution !== '240p') {
    if (await !shouldProcess(input, job.data.resolution)) return 'skipped resolution'
  }

  let lastProgressInt = 0
  const tmpDir = await fs.mkdtemp('/tmp/bken-transcode')
  const outputPath = `${tmpDir}/stream.m3u8`
  const ffmpegCommands = generateFfmpegCommand(job.data.resolution)

  try {
    return new Promise((resolve, reject) => {
      ffmpeg(input)
        .outputOptions(ffmpegCommands)
        .output(outputPath)
        .on('start', function (commandLine) {
          console.log('Spawned ffmpeg with command: ' + commandLine)
        })
        .on('progress', async function (progress: Progress) {
          if (progress.percent >= 0) {
            const currentProgressInt = Math.ceil(progress.percent)
            if (lastProgressInt !== currentProgressInt) {
              await job.updateProgress(currentProgressInt)
            }
            lastProgressInt = Math.ceil(progress.percent)
          }
        })
        .on('error', function (err) {
          console.log('An error occurred: ' + err.message)
          reject(err.message)
        })
        .on('end', async function () {
          console.log('Done')
          await uploadFolder(`${tmpDir}`, `v/${job.data.entityId}/hls/${job.data.resolution}`)
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
