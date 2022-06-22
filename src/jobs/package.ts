import fs from 'fs-extra'
import { PackageJob } from '../types'
import { rclone } from '../lib/rclone'
import { execProm } from '../utils/utils'

export async function packageJob(job: PackageJob) {
  console.log('package job starting...')
  const { inputs, output } = job.data
  const tmpDir = await fs.mkdtemp('/tmp/tidal-package-')

  try {
    console.info('downloading inputs')
    await Promise.all(
      inputs.map(({ path }) => {
        return rclone(`copy ${path} ${tmpDir}`)
      })
    )

    const packageCommands = [
      'packager',
      inputs.map(({ cmd }) => cmd),
      '--hls_master_playlist_output',
      '"master.m3u8"',
      '--mpd_output',
      '"master.mpd"',
    ]
    const result = await execProm(packageCommands.join(' '), tmpDir)
    console.log('Package Result: ', result)

    console.info(`copying ${tmpDir} to ${output}`)
    await rclone(`copy ${tmpDir} ${output}`)
  } catch (error) {
    console.error(error)
  } finally {
    await job.updateProgress(100)
  }
}
