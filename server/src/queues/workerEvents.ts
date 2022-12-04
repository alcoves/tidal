import chalk from 'chalk'
import { db } from '../config/db'
import { uuidv4 as uuid } from 'uuid'
import { getVideoFileLocation, getVideoPackageLocation } from '../lib/s3'
import { TranscodeJob, ThumbnailJob, PackagingJob } from '../types'

export const transcode = {
  onFailed: async (job: TranscodeJob, err: Error) => {
    console.debug(chalk.red.bold(`${job.queueName}:${job.id} :: Error:${JSON.stringify(err)}`))
    await db.videoFile.update({
      where: { id: job.data.videoFileId },
      data: { status: 'ERROR' },
    })
  },
  onProgress: async (job: TranscodeJob) => {
    console.debug(chalk.yellow(`${job.queueName}:${job.id} :: ${job.progress}`))
    await db.videoFile.upsert({
      where: { id: job.data.videoFileId },
      update: { status: 'PROCESSING' },
      create: {
        type: 'PROXY',
        status: 'PROCESSING',
        id: job.data.videoFileId,
        videoId: job.data.videoId,
        location: job.data.output,
      },
    })
  },
  onCompleted: async (job: TranscodeJob) => {
    console.debug(chalk.green.bold(`${job.queueName}:${job.id}`))
    await db.videoFile.update({
      data: { status: 'READY' },
      where: { id: job.data.videoFileId },
    })
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
        id: job.data.packageId,
        status: 'PROCESSING',
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
