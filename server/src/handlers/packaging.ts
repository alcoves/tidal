import chalk from 'chalk'
import path from 'path'
import fs from 'fs-extra'

import { gpac } from '../lib/gpac'
import { PackagingJob } from '../types'
import { downloadFile, parseS3Uri, uploadDir } from '../lib/s3'

export async function packagingJob(job: PackagingJob) {
  await job.updateProgress(1)
  console.info(chalk.blue('creating temporary directory'))
  const tmpDir = await fs.mkdtemp('/tmp/tidal-transcode-')

  console.info(chalk.blue('ensure working directories exist'))
  const withAdaptiveAssetsDirectory = `${tmpDir}/output`
  const withTranscodedAssetsDirectory = `${tmpDir}/inputs`
  await fs.ensureDir(withAdaptiveAssetsDirectory)
  await fs.ensureDir(withTranscodedAssetsDirectory)

  console.info(chalk.blue('downloading inputs'))
  const inputPaths = await Promise.all(
    job.data.inputs.map(async i => {
      const outputPath = `${tmpDir}/${path.basename(i)}`
      await downloadFile(outputPath, i)
      return outputPath
    })
  )

  const inputs = inputPaths.map(i => `-i ${i}`)
  const gpacArgs = `-o ${withAdaptiveAssetsDirectory}/main.m3u8:profile=onDemand`

  try {
    await gpac(`${inputs.join(' ')} ${gpacArgs}`)
    console.info(chalk.blue('uploading directory to remote'))
    await uploadDir(
      withAdaptiveAssetsDirectory,
      parseS3Uri(job.data.output).Key,
      parseS3Uri(job.data.output).Bucket
    )
  } catch (error) {
    console.error(chalk.red(error))
    throw error
  } finally {
    await job.updateProgress(100)
    console.info(chalk.blue(`removing ${tmpDir}`))
    await fs.remove(tmpDir)
  }
}
