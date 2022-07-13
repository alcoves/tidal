import chalk from 'chalk'
import { MetadataJob } from '../types'
import { getMetadata } from '../lib/video'

export async function metadataJob(job: MetadataJob) {
  console.log(chalk.blue('metadata job starting...'))
  const { input } = job.data

  try {
    console.info(chalk.blue('fetching metadata'))
    const metadata = await getMetadata(input)
    return { metadata }
  } catch (error) {
    console.error(chalk.red(error))
    throw error
  } finally {
    await job.updateProgress(100)
  }
}
