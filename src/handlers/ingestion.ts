import chalk from 'chalk'
import axios from 'axios'
import customFFmpeg from './customFFmpeg'

import { IngestionJob } from '../types'
import { PassThrough } from 'stream'
import s3, { s3URI } from '../lib/s3'
import { db } from '../config/db'
import { getMetadata } from '../lib/video'
import { enqueueThumbnailJob } from '../services/thumbnails'

// The job will download the file, get it's metadata from our s3, then return done
// To start, the job will update the database. but ideally there is a pattern to
// pass an update function into the event handlers
// Ingestion job should take an argument which determines if an automatic HLS encode should be
// added once the file is ingested

async function importFileFromURL({ bucket, key, url }) {
  console.log({ bucket, key, url })
  const passThrough = new PassThrough()
  const stream = await axios.get(url, { responseType: 'stream' })
  const response = s3.upload({ Bucket: bucket, Key: key, Body: passThrough }).promise()

  stream.data.pipe(passThrough)
  return response.then(data => data.Location)
}

export async function ingestionHandler(job: IngestionJob) {
  console.log(chalk.blue(`${job.queueName} job starting...`))

  try {
    console.log(chalk.blue(`importing file from URL`))
    await importFileFromURL({
      url: job.data.input,
      key: s3URI(job.data.s3OutputUri).Key,
      bucket: s3URI(job.data.s3OutputUri).Bucket,
    })

    const sourceUrl = await s3.getSignedUrlPromise('getObject', {
      Key: s3URI(job.data.s3OutputUri).Key,
      Bucket: s3URI(job.data.s3OutputUri).Bucket,
    })

    console.log(chalk.blue(`gathering metadata from source file`))
    const metadata = await getMetadata(sourceUrl)

    console.log(chalk.blue(`creating extra jobs`))
    await enqueueThumbnailJob(job.data.assetId)

    await db.video.update({
      where: { id: job.data.assetId },
      data: { status: 'READY', metadata: JSON.stringify(metadata) },
    })

    console.log('Done!')
  } catch (error) {
    await db.video.update({
      where: { id: job.data.assetId },
      data: { status: 'ERROR' },
    })
    console.error(chalk.red(error))
    throw error
  }
}
