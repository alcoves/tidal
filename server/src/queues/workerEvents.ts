import chalk from 'chalk'
import { db } from '../config/db'
import { IngestionJob, ThumbnailJob, TranscodeJob } from '../types'

// export const transcode = {
//   onFailed: async (job: TranscodeJob, err: Error) => {
//     console.log(chalk.red.bold(`${job.queueName}:${job.id} :: ${err.message}`))
//     if (job.name === 'transcode') {
//       await db.transcode.update({
//         where: { id: job.data.transcodeId },
//         data: { status: 'ERROR' },
//       })
//     }
//   },
//   onProgress: async (job: TranscodeJob) => {
//     console.log(chalk.yellow(`${job.queueName}:${job.id} :: ${job.progress}`))
//   },
//   onCompleted: async (job: TranscodeJob) => {
//     console.log(chalk.green.bold(`${job.queueName}:${job.id}`))
//     if (job.name === 'transcode') {
//       await db.transcode.update({
//         where: { id: job.data.transcodeId },
//         data: { status: 'READY', metadata: job.returnvalue },
//       })
//     }
//   },
// }

// export const thumbnail = {
//   onFailed: async (job: ThumbnailJob, err: Error) => {
//     console.log(chalk.red.bold(`${job.queueName}:${job.id} :: ${err.message}`))
//     if (job.name === 'thumbnail') {
//       await db.thumbnail.update({
//         where: { id: job.data.thumbnailId },
//         data: { status: 'ERROR' },
//       })
//     }
//   },
//   onProgress: async (job: ThumbnailJob) => {
//     console.log(chalk.yellow(`${job.queueName}:${job.id} :: ${job.progress}`))
//   },
//   onCompleted: async (job: ThumbnailJob) => {
//     console.log(chalk.green.bold(`${job.queueName}:${job.id}`))
//     if (job.name === 'thumbnail') {
//       await db.thumbnail.update({
//         where: { id: job.data.thumbnailId },
//         data: { status: 'READY' },
//       })
//     }
//   },
// }

export const ingestion = {
  onFailed: async (job: IngestionJob, err: Error) => {
    console.log(chalk.red.bold(`${job.queueName}:${job.id} :: ${err.message}`))
    if (job.name === 'ingestion') {
      await db.videoInput.update({
        where: { id: job.data.ingestionId },
        data: { status: 'ERROR' },
      })
    }
  },
  onProgress: async (job: IngestionJob) => {
    console.log(chalk.yellow(`${job.queueName}:${job.id} :: ${job.progress}`))
    // if (job.name === 'ingestion') {
    // await db.videoInput.update({
    //   where: { id: job.data.ingestionId },
    //   data: { progress: job.progress, status: "PROCESSING" },
    // })
    // }
  },
  onCompleted: async (job: IngestionJob) => {
    console.log(chalk.green.bold(`${job.queueName}:${job.id}`))
    if (job.name === 'ingestion') {
      await db.videoInput.update({
        where: { id: job.data.ingestionId },
        data: { status: 'READY', metadata: job.returnvalue },
      })
    }
  },
}
