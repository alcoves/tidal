import ffmpeg from "./ffmpeg";

interface TranscodeEvent {
  rcloneSourceUri: string
  rcloneDestinationUri: string
}

export default async function transcode(event: TranscodeEvent) {
  try {
    console.log('Creating temoporary directory');
    // const tmpDir = await fs.
  
    console.log('Writing entry to database');
    
  
    console.log('Fetching metadata');
  
    console.log('Fetching video presets');
  
    console.log('Generating ffmpeg arguments');
    // const ffargs = 
    
    console.log('Transcoding video');
    const ffRes = await ffmpeg(event.rcloneSourceUri, event.rcloneDestinationUri)
  
    console.log('Syncing assets to CDN');
  } catch (error) {
    console.log('An error occured');
    // write error to consul
    throw error;
  }
}