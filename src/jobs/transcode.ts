import fs from 'fs-extra'
import { rclone } from '../lib/rclone'
import { TranscodeJob } from '../types'
import { ffmpeg } from '../lib/child_process'

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
    await ffmpeg(cmd, { cwd: tmpDir })

    const outputFilepath = `${tmpDir}/${cmd.split(' ').pop()}`
    console.info(`uploading ${outputFilepath} to ${output}`)
    await rclone(`copyto ${outputFilepath} ${output}`)
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    await job.updateProgress(100)
    console.info(`removing ${tmpDir}`)
    await fs.remove(tmpDir)
  }
}
