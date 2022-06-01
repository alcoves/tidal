import { Job } from 'bullmq'
import { getSignedURL } from '../config/s3'
import { getMetadata } from '../utils/video'
import { Metadata, MetadataJobData } from '../types'

export async function ffprobeJob(job: Job): Promise<Metadata> {
  const { input }: MetadataJobData = job.data

  let signedUrl = ''
  if (input.includes('s3://')) {
    const Bucket = input.split('s3://')[1].split('/')[0]
    const Key = input.split('s3://')[1].split('/')[1]
    signedUrl = await getSignedURL({ Bucket, Key })
  }

  return getMetadata(signedUrl || input)
}
