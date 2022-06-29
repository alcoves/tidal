import chalk from 'chalk'
import { PublishJob } from '../types'
import { rclone } from '../lib/rclone'

export async function publishJob(job: PublishJob) {
  console.info(chalk.blue('publish job starting...'))
  const { input, output } = job.data
  await rclone(`copy ${input} ${output}`)
  await job.updateProgress(100)
}
