import fs from 'fs-extra'
import ffmpeg from './ffmpeg'
import rclone, { rcloneGetLink } from './rclone'
import { x264 } from './ffCommands'
import { getPresets } from './getPresets'
import { getMetadata } from './getMetadata'

interface TranscodeEvent {
  rcloneSourceUri: string
  rcloneDestinationUri: string
}

export default async function transcode (event: TranscodeEvent) {
  console.log('Creating temoporary directory')
  const tmpDir = await fs.mkdtemp('/tmp/tidal-')
  console.log('TMPDIR', tmpDir)

  try {
    // TODO console.log('Writing entry to database')
    console.log('Getting signed source file url')
    const signedSourceUri = await rcloneGetLink(event.rcloneSourceUri)
    console.log('SIGNEDSOURCEURI', signedSourceUri)

    console.log('Fetching metadata')
    const metadata = await getMetadata(signedSourceUri)
    console.log('METADATA', metadata)

    console.log('Fetching video presets')
    const presets = getPresets(metadata)
    console.log('PRESETS', presets)

    console.log('Generating ffmpeg arguments')
    const x264Commands = x264(metadata, presets)
    console.log('FFARGS', x264Commands)

    console.log('Transcoding video')
    await ffmpeg(
      signedSourceUri,
      tmpDir,
      x264Commands
    )

    console.log('Syncing assets to CDN')
    await rclone('copy', [tmpDir, event.rcloneDestinationUri, '-P'])
  } catch (error) {
    console.error('An error occured', error)
    // write error to consul
  } finally {
    console.log('Removing temporary directory', tmpDir)
    await fs.remove(tmpDir)
  }
}
