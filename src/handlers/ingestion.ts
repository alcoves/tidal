import url from 'url'
import path from 'path'
import chalk from 'chalk'
import axios from 'axios'
import customFFmpeg from '../jobs/customFFmpeg'

import { VideoJob } from '../types'
import { PassThrough } from 'stream'
import s3 from '../lib/s3'

// The job will download the file, get it's metadata from our s3, then return done
// To start, the job will update the database. but ideally there is a pattern to
// pass an update function into the event handlers
// Ingestion job should take an argument which determines if an automatic HLS encode should be
// added once the file is ingested

async function importFileFromURL({ bucket, key, url }) {
  const passThrough = new PassThrough()
  const stream = await axios.get(url, { responseType: 'stream' })
  const response = s3.upload({ Bucket: bucket, Key: key, Body: passThrough }).promise()

  stream.data.pipe(passThrough)
  return response.then(data => data.Location)
}

export async function ingestionHandler(job: VideoJob) {
  console.log(chalk.blue(`${job.queueName} job starting...`))

  try {
    console.log(chalk.blue(`parsing strings`))
    const cleanedUrl = url.parse(job.data.input).pathname || ''
    const extension = path.extname(cleanedUrl) || ''

    console.log(chalk.blue(`importing file from URL`))
    await importFileFromURL({
      url: job.data.input,
      key: `test${extension}`,
      bucket: process.env.TIDAL_BUCKET,
    })

    console.log(chalk.blue(`Gathering metadata from source file`))
    console.log(chalk.blue(`Computing bits and bobs`))
    console.log(chalk.blue(`Updating database?`))
    console.log(chalk.blue(`Or should each queue have custom handlers`))

    console.log('Done!')
    // await customFFmpeg(job.data)
  } catch (error) {
    console.error(chalk.red(error))
    throw error
  } finally {
    await job.updateProgress(100)
  }
}
