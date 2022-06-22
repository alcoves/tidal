import fs from 'fs-extra'
import { ffmpeg } from '../lib/spawn'
import { TranscodeJob } from '../types'
import { amazonS3URI, getSignedURL, uploadFile } from '../config/s3'

export async function transcodeJob(job: TranscodeJob) {
  console.log('Transcode job starting...')
  const { input, cmd, output } = job.data

  const signedUrl = await getSignedURL(amazonS3URI(input))

  const ffmpegCommandsSplit = cmd.split(' ')
  const outputFilename = ffmpegCommandsSplit.pop()
  if (!outputFilename) throw new Error('Invalid filename')

  const tmpDir = await fs.mkdtemp('/tmp/tidal-transcode-')

  try {
    const tmpFilePath = await ffmpeg({
      job,
      input: signedUrl,
      commands: ffmpegCommandsSplit,
      output: `${tmpDir}/${outputFilename}`,
    })

    await uploadFile(tmpFilePath, amazonS3URI(output))
  } catch (error) {
    console.error(error)
    throw error
  }
}
