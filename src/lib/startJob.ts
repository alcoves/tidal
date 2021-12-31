import db from '../../config/db'
import ffmpeg from 'fluent-ffmpeg'
import { Job } from '@prisma/client'

export function transcode(job: Job | null) {
  console.log('job', job)
  if (job) {
    return new Promise((resolve, reject) => {
      ffmpeg(job.input)
        .outputOptions(job.cmd.split(' '))
        .output(job.output)
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
          console.log('ffmpeg command completed')
          await db.job.update({ where: { id: job.id }, data: { status: 'READY', progress: 100 } })
          resolve('done')
        })
        .run()
    })
  }
}
