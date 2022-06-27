import chalk from 'chalk'
import { ExportJob } from '../types'
import { rclone } from '../lib/rclone'

export async function exportJob(job: ExportJob) {
  console.info(chalk.blue('export job starting...'))
  const { input, output } = job.data
  await rclone(`copy ${input} ${output}`)
  await job.updateProgress(100)
}
