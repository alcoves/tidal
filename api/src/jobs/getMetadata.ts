import { Job } from 'bullmq'
import { getSignedURL } from '../config/s3'
import { getMetadata } from '../utils/video'
import { Metadata, MetadataJobData } from '../types'

export async function getMetadataJob(job: Job): Promise<Metadata> {
  const { input }: MetadataJobData = job.data
  const signedUrl = await getSignedURL({ Bucket: input.bucket, Key: input.key })
  return getMetadata(signedUrl)
}
