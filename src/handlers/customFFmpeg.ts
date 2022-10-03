import { VideoJobData } from '../types'

export default function customFFmpeg(args: VideoJobData) {
  try {
    console.log('here', args)
  } catch (error) {
    throw error
  }
}
