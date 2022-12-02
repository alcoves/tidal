import chalk from 'chalk'
import { db } from '../config/db'
import { getAdaptiveLocation } from '../lib/s3'
import { AdaptiveTranscodeJob, ThumbnailJob } from '../types'

export const adaptiveTranscode = {
  onFailed: async (job: AdaptiveTranscodeJob, err: Error) => {
    console.debug(chalk.red.bold(`${job.queueName}:${job.id} :: Error:${JSON.stringify(err)}`))
    await db.videoPlayback.update({
      where: { id: job.data.playbackId },
      data: { status: 'ERROR' },
    })
  },
  onProgress: async (job: AdaptiveTranscodeJob) => {
    console.debug(chalk.yellow(`${job.queueName}:${job.id} :: ${job.progress}`))
    await db.videoPlayback.upsert({
      where: { id: job.data.playbackId },
      update: { status: 'PROCESSING' },
      create: {
        status: 'PROCESSING',
        id: job.data.playbackId,
        videoId: job.data.videoId,
        location: getAdaptiveLocation(job.data.videoId, job.data.playbackId),
      },
    })
  },
  onCompleted: async (job: AdaptiveTranscodeJob) => {
    console.debug(chalk.green.bold(`${job.queueName}:${job.id}`))
    await db.videoPlayback.update({
      data: { status: 'READY' },
      where: { id: job.data.playbackId },
    })
  },
}

export const thumbnail = {
  onFailed: async (job: ThumbnailJob, err: Error) => {
    console.log(chalk.red.bold(`${job.queueName}:${job.id} :: ${err.message}`))
    // if (job.name === 'thumbnail') {
    //   await db.videoThumbnail.update({
    //     where: { id: job.data.thumbnailId },
    //   })
    // }
  },
  onProgress: async (job: ThumbnailJob) => {
    console.log(chalk.yellow(`${job.queueName}:${job.id} :: ${job.progress}`))
  },
  onCompleted: async (job: ThumbnailJob) => {
    console.log(chalk.green.bold(`${job.queueName}:${job.id}`))
    // if (job.name === 'thumbnail') {
    //   await db.videoThumbnail.update({
    //     where: { id: job.data.thumbnailId },
    //   })
    // }
  },
}
