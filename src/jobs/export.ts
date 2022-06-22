import { Job } from 'bullmq'

export async function exportJob(job: Job) {
  console.log('export job starting...')
  // const { input, output } = job.data
  // await rclone('copy ${input} ${output}')
  await job.updateProgress(100)
}
