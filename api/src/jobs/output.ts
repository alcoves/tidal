import fs from 'fs-extra'
import { Job } from 'bullmq'
import { OutputJobData } from '../types'
import { execProm } from '../utils/utils'

export async function outputJob(job: Job) {
  const { package_cmds }: OutputJobData = job.data

  const tmpDir = await fs.mkdtemp('/tmp/bken-output-')

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
    console.log('Result', result)
  }

  // Sync all the files from the tmp folder to the output folder/remote
}
