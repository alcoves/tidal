import _ from "lodash"
import AWS from "aws-sdk"
import fs from "fs-extra"

const s3 = new AWS.S3({
  credentials: new AWS.Credentials({
    accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
    secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
  }),
  signatureVersion: "v4",
  endpoint: new AWS.Endpoint(process.env.WASABI_ENDPOINT)
})

// export async function listObjects(params = {}, key = "Contents", items = [] ) {
//   const req = await s3.listObjectsV2(params).promise()
//   req[key].map((i)=> items.push(i))
//   if (req.NextContinuationToken) {
//     params.ContinuationToken = req.NextContinuationToken
//     return listObjects(params, key, items)
//   }
//   return items
// }

export async function deleteFolder(params: any): Promise<(params: any) => typeof deleteFolder> {
  const req = await s3.listObjectsV2(params).promise()
  await s3.deleteObjects({
    Bucket: "cdn.bken.io",
    Delete: { Objects: req.Contents.map(({ Key }) => ({ Key })) },
  }).promise()

  if (req.NextContinuationToken) {
    params.ContinuationToken = req.NextContinuationToken
    return deleteFolder(params)
  }
}

async function copy(dir: string, destinationParams: any) { // TODO :: Type destination params
  const files = await fs.readdir(dir)
  for (const chunk of _.chunk(files, 50)) {
    await Promise.all(chunk.map((fileName) => {
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
}

export {
  s3,
  copy
}