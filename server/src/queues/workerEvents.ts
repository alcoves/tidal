import chalk from 'chalk'
import { db } from '../config/db'
import { getVideoPackageLocation } from '../lib/s3'
import { TranscodeJob, ThumbnailJob, PackagingJob } from '../types'

export const transcode = {
  onFailed: async (job: TranscodeJob, err: Error) => {
    console.debug(chalk.red.bold(`${job.queueName}:${job.id} :: Error:${JSON.stringify(err)}`))
    // await db.videoPlayback.update({
    //   where: { id: job.data.packageId },
    //   data: { status: 'ERROR' },
    // })
  },
  onProgress: async (job: TranscodeJob) => {
    console.debug(chalk.yellow(`${job.queueName}:${job.id} :: ${job.progress}`))
    // await db.videoPlayback.upsert({
    //   where: { id: job.data.packageId },
    //   update: { status: 'PROCESSING' },
    //   create: {
    //     status: 'PROCESSING',
    //     id: job.data.packageId,
    //     videoId: job.data.videoId,
    //     location: getVideoPackageLocation(job.data.videoId, job.data.packageId),
    //   },
    // })
  },
  onCompleted: async (job: TranscodeJob) => {
    console.debug(chalk.green.bold(`${job.queueName}:${job.id}`))
    // await db.videoPlayback.update({
    //   data: { status: 'READY' },
    //   where: { id: job.data.packageId },
    // })
  },
}

export const packaging = {
  onFailed: async (job: PackagingJob, err: Error) => {
    console.debug(chalk.red.bold(`${job.queueName}:${job.id} :: Error:${JSON.stringify(err)}`))
    await db.videoPackage.update({
      where: { id: job.data.packageId },
      data: { status: 'ERROR' },
    })
  },
  onProgress: async (job: PackagingJob) => {
    console.debug(chalk.yellow(`${job.queueName}:${job.id} :: ${job.progress}`))
    await db.videoPackage.upsert({
      where: { id: job.data.packageId },
      update: { status: 'PROCESSING' },
      create: {
        status: 'PROCESSING',
        id: job.data.packageId,
        videoId: job.data.videoId,
        location: getVideoPackageLocation(job.data.videoId, job.data.packageId),
      },
    })
  },
  onCompleted: async (job: PackagingJob) => {
    console.debug(chalk.green.bold(`${job.queueName}:${job.id}`))
    await db.videoPackage.update({
      data: { status: 'READY' },
      where: { id: job.data.packageId },
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
