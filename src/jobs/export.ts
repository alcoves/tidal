import fs from 'fs-extra'
import { Job } from 'bullmq'
import { TidalJob } from '../types'
import { uploadFolder } from '../config/s3'

export async function exportJob(job: Job) {
  console.log('Export job starting...')
  await job.updateProgress(100)
}
