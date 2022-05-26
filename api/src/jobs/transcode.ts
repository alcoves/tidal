import path from 'path'
import fs from 'fs-extra'
import ffmpeg from 'fluent-ffmpeg'
import { Job } from 'bullmq'
import { purgeURL } from '../utils/bunny'
import { getSettings } from '../utils/redis'
import { Progress, TranscodeJobData } from '../types'
import { getS3Config, getSignedURL, uploadFolder } from '../config/s3'

export async function transcodePreset(job: Job) {
  const { input, cmd, output }: TranscodeJobData = job.data

  let signedUrl = ''
  let lastProgress = 0

  const ffmpegCommandsSplit = cmd.split(' ')
  const outputFilename = ffmpegCommandsSplit.pop()

  if (input.includes('s3://')) {
    const Bucket = input.split('s3://')[1].split('/')[0]
    const Key = input.split('s3://')[1].split('/')[1]
    signedUrl = await getSignedURL({ Bucket, Key })
  }

  const tmpDir = await fs.mkdtemp('/tmp/bken-transcode-')
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
          const tmpFiles = await fs.readdir(tmpDir)
          const m3u8File = tmpFiles.find(file => file.endsWith('master.m3u8'))

          if (output.includes('s3://')) {
            console.log('output to s3')
            const outputKey = output.split('s3://')[1].split('/')[1]
            const outputBucket = output.split('s3://')[1].split('/')[0]

            // TODO :: Purge URLs from CDN?
            await uploadFolder(tmpDir, { Bucket: outputBucket, Key: outputKey })
          } else {
            await fs.ensureDir(output)
            await Promise.all(
              tmpFiles.map(f => fs.move(`${tmpDir}/${f}`, `${output}/${f}`, { overwrite: true }))
            )
          }

          console.log('Done')
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

export async function outputTranscode(job: Job) {
  console.log('test')
  // Sync all the files from the tmp folder to the output folder/remote
}
