import path from 'path'
import fs from 'fs-extra'
import { ffmpeg, spawnFFmpeg } from '../lib/spawn'
import { rclone } from '../lib/rclone'
import { TranscodeJob } from '../types'

export async function transcodeJob(job: TranscodeJob) {
  console.log('transcode job starting...')
  const { input, cmd, output } = job.data

  console.info('creating temporary directory')
  const tmpDir = await fs.mkdtemp('/tmp/tidal-transcode-')

  try {
    console.info('downloading chunk from remote')
    await rclone(`copy ${input} ${tmpDir}`)

    console.info('assigning variables and checking filename')
    const ffmpegCommandsSplit = cmd.split(' ')
    const outputFilename = ffmpegCommandsSplit.pop()
    if (!outputFilename) throw new Error('invalid filename')

    console.info('transcoding with ffmpeg', cmd)
    await spawnFFmpeg(cmd, tmpDir)

    const outputFilepath = `${tmpDir}/${cmd.split(' ').pop()}`
    console.info(`uploading ${outputFilepath} to ${output}`)
    await rclone(`copyto ${outputFilepath} ${output}`)
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    console.info(`removing ${tmpDir}`)
    // await fs.remove(tmpDir)
  }
}
