import ffmpeg from './ffmpeg'
import { getMetadata } from './getMetadata'

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

    console.log('Generating ffmpeg arguments')

    console.log('Transcoding video')
    await ffmpeg(
      event.rcloneSourceUri,
      event.rcloneDestinationUri,
      '-c:v libx264 -crf 35'
    )

    console.log('Syncing assets to CDN')
  } catch (error) {
    console.log('An error occured')
    // write error to consul
    throw error
  }
}
