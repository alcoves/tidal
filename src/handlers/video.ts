import chalk from 'chalk'
import customFFmpeg from '../jobs/customFFmpeg'
import { VideoJob } from '../types'

export async function videoHandler(job: VideoJob) {
  console.log(chalk.blue(`${job.queueName} job starting...`))

  try {
    await customFFmpeg(job.data)
  } catch (error) {
    console.error(chalk.red(error))
    throw error
  } finally {
    await job.updateProgress(100)
  }
}
