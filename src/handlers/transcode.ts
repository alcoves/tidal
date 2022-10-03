import { TranscodeJob } from '../types'

export async function transcodeJob(job: TranscodeJob) {
  console.log('job', job.data)
  return 'done'
}
