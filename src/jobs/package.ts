import fs from 'fs-extra'
import Path from 'path'
import { PackageJob } from '../types'
import { amazonS3URI, getSignedURL, uploadFile, uploadFolder } from '../config/s3'
import { downloadFile, execProm } from '../utils/utils'

export async function packageJob(job: PackageJob) {
  console.log('Package job starting...')
  const { inputs, output } = job.data
  const tmpDir = await fs.mkdtemp('/tmp/tidal-package-')

  try {
    for (const { path } of inputs) {
      const signedURL = await getSignedURL(amazonS3URI(path))
      const filename = Path.basename(path)
      await downloadFile(signedURL, `${tmpDir}/${filename}`)
    }

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

    console.log('Cleaning up downloads')
    // Removes the files used for packaging that we don't want in the remote
    // Could also move packaging assets to a seperate folder
    const files = await fs.readdir(tmpDir)
    await Promise.all(
      files.map(f => {
        if (f.includes('.mp4')) return fs.rm(`${tmpDir}/${f}`)
      })
    )

    console.info(`Uploading package to ${output}`)
    await uploadFolder(tmpDir, amazonS3URI(output))
  } catch (error) {
    console.error(error)
  } finally {
    await job.updateProgress(100)
  }
}
