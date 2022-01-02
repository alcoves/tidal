import s3 from '../config/s3'

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
        Bucket: '',
      })
      .promise()
  })

  return res.sendStatus(200)
}
