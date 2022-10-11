export function getThumbnailUrlFromS3Uri(s3Uri: string) {
  const url = `http://localhost:3030/${s3Uri.split('s3://')[1]}`
  return url
}
