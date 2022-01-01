import path from 'path'
import fs from 'fs-extra'
import db from '../config/db'
import mime from 'mime-types'
import ffmpeg from 'fluent-ffmpeg'
import { Job } from '@prisma/client'
import s3, { getSignedURL, getUrlParamsFromS3Uri } from '../config/s3'

export function transcode(job: Job | null) {
  console.log('job', job)
  if (job) {
    return new Promise(async (resolve, reject) => {
      const { Bucket, Key } = getUrlParamsFromS3Uri(job.input)
      const signedUrl = await getSignedURL({ Bucket, Key })

      const tmpDir = fs.mkdtempSync('/tmp/tidal-')
      const filename = path.basename(job.output)
      const tmpOutPath = `${tmpDir}/${filename}`

      ffmpeg(signedUrl)
        .outputOptions(job.cmd.split(' '))
        .output(tmpOutPath)
        .on('start', function (commandLine) {
          console.log('Spawned Ffmpeg with command: ' + commandLine)
        })
        .on('progress', async function (progress) {
          console.log('Processing: ' + progress.percent + '%')
          if (progress.percent) {
            await db.job.update({
              where: { id: job.id },
              data: { status: 'PROCESSING', progress: progress.percent },
            })
          }
        })
        .on('error', async function (err) {
          console.log('An error occurred: ' + err.message)
          await db.job.update({ where: { id: job.id }, data: { status: 'ERROR' } })
          reject(err.message)
        })
        .on('end', async function () {
          console.log('Moving to final destination')
          const { Bucket, Key } = getUrlParamsFromS3Uri(job.output)
          await s3
            .upload({
              Bucket,
              Key,
              ContentType: mime.lookup(tmpOutPath),
              Body: fs.createReadStream(tmpOutPath),
            })
            .promise()
          await fs.remove(tmpDir)
          await db.job.update({ where: { id: job.id }, data: { status: 'READY', progress: 100 } })
          resolve('done')
        })
        .run()
    })
  }
}
