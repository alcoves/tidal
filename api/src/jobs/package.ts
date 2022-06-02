import { Job } from 'bullmq'
import { PackageJobData } from '../types'
import { execProm } from '../utils/utils'

export async function packageJob(job: Job) {
  console.log('Package job starting...')
  const { package_cmds, tmpDir }: PackageJobData = job.data

  try {
    if (package_cmds.length) {
      const packageCommands = [
        'packager',
        ...package_cmds,
        '--hls_master_playlist_output',
        '"master.m3u8"',
        '--mpd_output',
        '"master.mpd"',
      ]

      const result = await execProm(packageCommands.join(' '), tmpDir)
      console.log('Package Result: ', result)
    }
  } catch (error) {
    console.error(error)
  } finally {
    await job.updateProgress(100)
  }
}
