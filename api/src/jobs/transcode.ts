import fs from 'fs-extra'
import ffmpeg from 'fluent-ffmpeg'
import { Job } from 'bullmq'
import { Progress, TranscodeJobData } from '../types'
import { getSignedURL, uploadFolder } from '../config/s3'
import { getMetadata, skipResolution } from '../utils/video'

export async function transcode(job: Job) {
  const { input, cmd, output, constraints }: TranscodeJobData = job.data

  let signedUrl = ''
  let lastProgress = 0

  const ffmpegCommandsSplit = cmd.split(' ')
  const outputFilename = ffmpegCommandsSplit.pop()

  if (input.includes('s3://')) {
    const Bucket = input.split('s3://')[1].split('/')[0]
    const Key = input.split('s3://')[1].split('/')[1]
    signedUrl = await getSignedURL({ Bucket, Key })
  }

  const metadata = await getMetadata(signedUrl || input)
  const shouldSkip = skipResolution({
    sourceWidth: metadata.video?.width || 0,
    sourceHeight: metadata.video?.height || 0,
    maxWidth: constraints.width || 0,
    maxHeight: constraints.height || 0,
  })
  if (shouldSkip) {
    await job.updateProgress(100)
    return
  }

  const tmpDir = await fs.mkdtemp('/tmp/bken-transcode')
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
          if (output.includes('s3://')) {
            console.log('output to s3')
            const outputKey = output.split('s3://')[1].split('/')[1]
            const outputBucket = output.split('s3://')[1].split('/')[0]

            // TODO :: Purge URLs from CDN?
            await uploadFolder(tmpDir, { Bucket: outputBucket, Key: outputKey })
          } else {
            const tmpFiles = await fs.readdir(tmpDir)
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
