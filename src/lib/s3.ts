import AWS from 'aws-sdk'

const opts: AWS.S3.ClientConfiguration = {}

if (process.env.AWS_ENDPONT) {
  opts.endpoint = new AWS.Endpoint(process.env.AWS_ENDPONT)
}

const s3 = new AWS.S3(opts)

export function s3URI(uri: string) {
  const s3UrlRe = /^[sS]3:\/\/(.*?)\/(.*)/
  const match = uri.match(s3UrlRe)
  if (!match) throw new Error(`Not a valid S3 URI: ${uri}`)

  return {
    Bucket: match[1],
    Key: match[2],
  }
}

export default s3
