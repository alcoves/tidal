import chalk from 'chalk'
import customFFmpeg from '../jobs/customFFmpeg'
import { VideoJob } from '../types'

// The job will download the file, get it's metadata from our s3, then return done
// To start, the job will update the database. but ideally there is a pattern to
// pass an update function into the event handlers
// Ingestion job should take an argument which determines if an automatic HLS encode should be
// added once the file is ingested

export async function ingestionHandler(job: VideoJob) {
  console.log(chalk.blue(`${job.queueName} job starting...`))

  try {
    console.log('Done!')
    // await customFFmpeg(job.data)
  } catch (error) {
    console.error(chalk.red(error))
    throw error
  } finally {
    await job.updateProgress(100)
  }
}
