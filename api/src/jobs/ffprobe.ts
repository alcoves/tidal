import { Job } from 'bullmq'
import { getSignedURL } from '../config/s3'
import { getMetadata } from '../utils/video'
import { Metadata, TidalJob } from '../types'

export async function ffprobeJob(job: Job): Promise<Metadata> {
  const { input }: TidalJob = job.data

  if (!input) {
    throw new Error('Invalid inputs')
  }

  let signedUrl = ''
  if (input.includes('s3://')) {
    const Bucket = input.split('s3://')[1].split('/')[0]
    const Key = input.split('s3://')[1].split('/')[1]
    signedUrl = await getSignedURL({ Bucket, Key })
  }

  const metadata = await getMetadata(signedUrl || input)
  await job.updateProgress(100)
  return metadata
}
