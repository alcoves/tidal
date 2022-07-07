import chalk from 'chalk'
import fs from 'fs-extra'
import { ffmpeg } from '../lib/child_process'
import { AdaptiveTranscodeJob, AdaptiveTranscodeType } from '../types'

export async function adaptiveTranscodeJob(job: AdaptiveTranscodeJob) {
  console.log(chalk.blue('transcode job starting...'))
  const { input, transcodes, output } = job.data

  console.info(chalk.blue('creating temporary directory'))
  const tmpDir = await fs.mkdtemp('/tmp/tidal-transcode-')

  const audioTranscodes = transcodes.filter(({ type }) => type === AdaptiveTranscodeType.audio)
  const videoTranscodes = transcodes.filter(({ type }) => type === AdaptiveTranscodeType.video)

  try {
    for (const audioTranscode of audioTranscodes) {
      console.info(chalk.blue(`processing ${audioTranscode.type} transcode`))
      console.info(chalk.blue(`running command: ${audioTranscode.cmd}`))
    }

    for (const videoTranscode of videoTranscodes) {
      console.info(chalk.blue(`processing ${videoTranscode.type} transcode`))
      console.info(chalk.blue(`running command: ${videoTranscode.cmd}`))
    }

    console.info(chalk.blue(`packaging assets`))

    console.info(chalk.blue(`uploading assets to destination`))

    console.info(chalk.blue(`finished adaptive transcode`))
  } catch (error) {
    console.error(chalk.red(error))
    throw error
  } finally {
    await job.updateProgress(100)
    console.info(chalk.blue(`removing ${tmpDir}`))
    await fs.remove(tmpDir)
  }
}
