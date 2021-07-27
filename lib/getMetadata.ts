import { ffprobe } from 'fluent-ffmpeg';

export default async function metadata(input: string) {
  const metadata = await ffprobe(input)
  return metadata
}