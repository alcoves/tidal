import fs from 'fs-extra'
import { Job } from 'bullmq'
import { OutputJobData } from '../types'
import { uploadFolder } from '../config/s3'

export async function outputJob(job: Job) {
  console.log('Output job starting...')
  const { tmpDir, output }: OutputJobData = job.data

  try {
    if (output.includes('s3://')) {
      console.log('Uploading files to S3', output)
      const Key = output.split('s3://')[1].split('/')[1]
      const Bucket = output.split('s3://')[1].split('/')[0]
      await uploadFolder(tmpDir, { Bucket, Key })
    } else {
      console.log(`Moving files from ${tmpDir} to ${output}`)
      await fs.ensureDir(output)
      await fs.copy(tmpDir, output, { overwrite: true })
    }
  } catch (error) {
    console.error(error)
  } finally {
    await fs.rmdir(tmpDir)
  }
}
