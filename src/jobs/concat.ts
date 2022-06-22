import fs from 'fs-extra'
import { Job } from 'bullmq'
import { TidalJob } from '../types'
import { uploadFolder } from '../config/s3'

export async function concatJob(job: Job) {
  console.log('Concat job starting...')
  await job.updateProgress(100)

  // Takes in input dir
  // Signs all urls
  // Constructs concat command for ffmpeg
  // Sends it
  // Uploads
  // console.log('Output job starting...')
  // const { tmpDir, output }: TidalJob = job.data
  // if (!tmpDir || !output) {
  //   throw new Error('Invalid inputs')
  // }
  // try {
  //   if (output.includes('s3://')) {
  //     console.log('Uploading files to S3', output)
  //     const Key = output.split('s3://')[1].split('/')[1]
  //     const Bucket = output.split('s3://')[1].split('/')[0]
  //     await uploadFolder(tmpDir, { Bucket, Key })
  //   } else {
  //     console.log(`Moving files from ${tmpDir} to ${output}`)
  //     await fs.ensureDir(output)
  //     await fs.copy(tmpDir, output, { overwrite: true })
  //   }
  // } catch (error) {
  //   console.error(error)
  // } finally {
  //   await fs.remove(tmpDir)
  //   await job.updateProgress(100)
  // }
  return 'done'
}
