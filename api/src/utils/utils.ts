import path from 'path'
import { getSettings } from './redis'
import { getSignedURL } from '../config/s3'

export async function parseInput(input: string): Promise<string> {
  try {
    const settings = await getSettings()
    if (input.includes('s3://')) {
      const [Bucket, Key] = input.split('s3://')[1].split('/')
      const signedUrl = await getSignedURL({ Bucket, Key })
      return signedUrl
    }
    return path.normalize(`${settings.nfsMountPath}/${input}`)
  } catch (error) {
    console.error(error)
    throw new Error('Failed to parse input')
  }
}

export async function parseOutput(output: string): Promise<string> {
  const settings = await getSettings()
  return path.normalize(`${settings.nfsMountPath}/${output}`)
}
