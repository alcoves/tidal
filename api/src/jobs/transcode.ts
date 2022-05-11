import path from 'path'
import fs from 'fs-extra'
import ffmpeg from 'fluent-ffmpeg'
import { Job } from 'bullmq'
import { Progress, TranscodeJobData } from '../types'
import { uploadFile, uploadFolder } from '../config/s3'
import { getSettings } from '../utils/redis'

export async function transcode(job: Job) {
  const { input, cmd, output }: TranscodeJobData = job.data

  let lastProgress = 0
  const tmpDir = await fs.mkdtemp('/tmp/bken-transcode')
  const outputFilename = path.basename(output)
  const tmpOutputFilepath = `${tmpDir}/${outputFilename}`

  console.log('tmpOutputFilepath', tmpOutputFilepath)

  try {
    return new Promise((resolve, reject) => {
      ffmpeg(input)
        .outputOptions(cmd.split(' '))
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
          const outputFileExt = path.extname(output)

          if (output.includes('s3://')) {
            console.log('output to s3')
            const outputKey = output.split('s3://')[1].split('/')[1]
            const outputBucket = output.split('s3://')[1].split('/')[0]

            // TODO :: Purge URLs from CDN?

            if (outputFileExt) {
              console.log('output is a file')
              await uploadFile(tmpOutputFilepath, { Bucket: outputBucket, Key: outputKey })
            } else {
              console.log('output is a directory')
              await uploadFolder(tmpDir, { Bucket: outputBucket, Key: outputKey })
            }
          } else {
            console.log('output to NFS')
            const settings = await getSettings()
            const fullOutputPath = path.normalize(`${settings.nfsMountPath}/${output}`)

            if (outputFileExt) {
              console.log('output is a file')
              await fs.move(tmpOutputFilepath, fullOutputPath, { overwrite: true })
            } else {
              console.log('output is a directory')
              await fs.move(tmpDir, fullOutputPath, { overwrite: true })
            }
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
