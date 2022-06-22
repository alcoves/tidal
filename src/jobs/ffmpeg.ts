import { Job } from 'bullmq'
import { getSignedURL } from '../config/s3'
import { TidalJob } from '../types'
import { ffmpeg } from '../utils/ffmpeg'

export async function ffmpegJob(job: Job) {
  console.log('Transcode job starting...')
  const { input, cmd, tmpDir }: TidalJob = job.data

  if (!input || !cmd || !tmpDir) {
    throw new Error('Invalid inputs')
  }

  let signedUrl = ''

  const ffmpegCommandsSplit = cmd.split(' ')
  const outputFilename = ffmpegCommandsSplit.pop()

  if (input.includes('s3://')) {
    const Bucket = input.split('s3://')[1].split('/')[0]
    const Key = input.split('s3://')[1].split('/')[1]
    signedUrl = await getSignedURL({ Bucket, Key })
  }

  const tmpOutputFilepath = `${tmpDir}/${outputFilename}`

  try {
    await ffmpeg({
      input: signedUrl || input,
      output: tmpOutputFilepath,
      commands: ffmpegCommandsSplit,
      updateFunction: job.updateProgress,
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}
