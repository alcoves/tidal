import s3 from "../lib/s3"
import mime from "mime"
import { Request, Response } from "express"

export async function upload(req: Request, res: Response) {
  const { assetId, renditionId, filename } = req.params
  console.log("Uploading", filename, mime.getType(filename))
  await s3.upload({
    Body: req,
    Bucket: process.env.S3_BUCKET,
    ContentType: mime.getType(filename),
    Key: `v/${assetId}/${renditionId}/${req.params.filename}`
  }).promise()
  return res.sendStatus(200)
}