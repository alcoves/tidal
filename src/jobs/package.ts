import { Job } from 'bullmq'
import { TidalJob } from '../types'
import { execProm } from '../utils/utils'

export async function packageJob(job: Job) {
  console.log('Package job starting...')
  const { cmd, tmpDir }: TidalJob = job.data

  if (!cmd || !tmpDir) {
    throw new Error('Invalid inputs')
  }

  try {
    const packageCommands = [
      'packager',
      cmd,
      '--hls_master_playlist_output',
      '"master.m3u8"',
      '--mpd_output',
      '"master.mpd"',
    ]

    const result = await execProm(packageCommands.join(' '), tmpDir)
    console.log('Package Result: ', result)
  } catch (error) {
    console.error(error)
  } finally {
    await job.updateProgress(100)
  }
}
