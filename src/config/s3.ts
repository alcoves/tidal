import AWS from "aws-sdk"
import fs from "fs-extra"

const s3 = new AWS.S3({
  credentials: new AWS.Credentials({
    accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
    secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
  }),
  endpoint: new AWS.Endpoint(process.env.WASABI_ENDPOINT)
})

async function copy(dir: string, destinationParams: any) { // TODO :: Type destination params
  const files = await fs.readdir(dir)
  await Promise.all(files.map((fileName) => {
    const uploadPath = `${dir}/${fileName}`
    const destinationPath = `${destinationParams.Key}/${fileName}`
    console.info(`Uploading ${uploadPath} to ${destinationPath}`)
    return s3.upload({
      Key: destinationPath,
      Bucket: destinationParams.Bucket,
      Body: fs.createReadStream(`${dir}/${fileName}`),
    }).promise()
  }))
}

export {
  s3,
  copy
}