import AWS from 'aws-sdk'

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint(''),
})

export default s3
