import { TIDAL_CDN_ENDPOINT, TIDAL_API_ENDPOINT } from './global'

export function getThumbnailUrlFromS3Uri(s3Uri: string) {
  return `${TIDAL_CDN_ENDPOINT}/${s3Uri.split('s3://')[1]}`
}

export function getMainPlayback(id: string) {
  return `${TIDAL_API_ENDPOINT}/play/${id}`
}
