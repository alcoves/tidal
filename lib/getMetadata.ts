import { ffprobe } from 'fluent-ffmpeg'

export function getMetadata (input: string) {
  return new Promise((resolve, reject) => {
    ffprobe(input, function (err, metadata) {
      if (err) reject(err)
      resolve(metadata)
    })
  })
}

export interface Metadata {
  width: number,
  height: number
}
