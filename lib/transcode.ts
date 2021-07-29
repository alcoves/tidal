import ffmpeg from './ffmpeg'
import { getMetadata } from './getMetadata'
import { getPresets } from './getPresets'
import { getFfmpegArgs } from './getFfmpegArgs'

interface TranscodeEvent {
  rcloneSourceUri: string
  rcloneDestinationUri: string
}

export default async function transcode (event: TranscodeEvent) {
  try {
    console.log('Creating temoporary directory')

    console.log('Writing entry to database')

    console.log('Fetching metadata')
    const metadata = await getMetadata(event.rcloneSourceUri)
    console.log('METADATA', metadata)

    console.log('Fetching video presets')
    const presets = getPresets(metadata)
    console.log('PRESETS', presets)

    console.log('Generating ffmpeg arguments')
    const ffCommands = getFfmpegArgs(metadata, presets)
    console.log('FFARGS', ffCommands)

    console.log('Transcoding video')
    await ffmpeg(
      event.rcloneSourceUri,
      event.rcloneDestinationUri,
      ffCommands
    )

    console.log('Syncing assets to CDN')
  } catch (error) {
    console.log('An error occured')
    // write error to consul
    throw error
  }
}
