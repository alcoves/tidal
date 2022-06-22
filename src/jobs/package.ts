import { PackageJob } from '../types'
import { execProm } from '../utils/utils'

export async function packageJob(job: PackageJob) {
  console.log('Package job starting...')
  const { inputs, output } = job.data

  // Create signed urls for inputs
  // Create packager commands based on inputs

  try {
    // const packageCommands = [
    //   'packager',
    //   cmd,
    //   '--hls_master_playlist_output',
    //   '"master.m3u8"',
    //   '--mpd_output',
    //   '"master.mpd"',
    // ]
    // const result = await execProm(packageCommands.join(' '), tmpDir)
    // console.log('Package Result: ', result)
  } catch (error) {
    console.error(error)
  } finally {
    await job.updateProgress(100)
  }
}
