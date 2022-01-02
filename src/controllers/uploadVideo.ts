import s3, { defaultBucket } from '../config/s3'

export async function uploadVideo(req, res) {
  let data = Buffer.from('')
  req.on('data', function (chunk) {
    data = Buffer.concat([data, chunk])
  })
  req.on('end', async function () {
    req.rawBody = data
    console.log('I can upload!')

    await s3
      .upload({
        Body: req.rawBody,
        Bucket: defaultBucket,
        ContentType: 'video/mp4',
        Key: `v/${req.params.videoId}/original`,
      })
      .promise()

    return res.sendStatus(200)
  })
}
