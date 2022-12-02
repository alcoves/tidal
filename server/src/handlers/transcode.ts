import chalk from 'chalk'
import fs from 'fs-extra'

import { ffmpeg } from '../lib/ffmpeg'
import { TranscodeJob } from '../types'
import s3, { parseS3Uri, uploadDir } from '../lib/s3'
import globals from '../config/globals'

export async function transcodeJob(job: TranscodeJob) {
  await job.updateProgress(1)
  console.info(chalk.blue('creating temporary directory'))
  const tmpDir = await fs.mkdtemp('/tmp/tidal-transcode-')
  const adaptiveSyncDir = `output`
  const fullAdaptiveSyncDir = `${tmpDir}/${adaptiveSyncDir}`
  await fs.ensureDir(fullAdaptiveSyncDir)

  const sourceLink = await s3.getSignedUrlPromise('getObject', {
    Key: parseS3Uri(job.data.input).Key,
    Bucket: parseS3Uri(job.data.input).Bucket,
  })

  const codecArgs = `-c:v libsvtav1 -crf 40 -preset 8 -c:a libopus -ac 2 -b:a 128k`
  const hlsArgs = `-master_pl_name ${globals.mainM3U8Name} -hls_time 6 -hls_playlist_type vod -hls_segment_type fmp4`
  const resolutionArgs = `-filter:v scale='min(1280,iw)':min'(720,ih)':force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2`
  const command = `${codecArgs} ${hlsArgs} ${resolutionArgs} ${adaptiveSyncDir}/playlist.m3u8`

  try {
    await ffmpeg(`-i ${sourceLink} ${command}`, {
      cwd: tmpDir,
    })
    console.info(chalk.blue('uploading hls directory to remote'))
    await uploadDir(
      fullAdaptiveSyncDir,
      parseS3Uri(job.data.output).Key,
      parseS3Uri(job.data.output).Bucket
    )
  } catch (error) {
    console.error(chalk.red(error))
    throw error
  } finally {
    await job.updateProgress(100)
    console.info(chalk.blue(`removing ${tmpDir}`))
    await fs.remove(tmpDir)
  }
}
