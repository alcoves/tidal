import s3 from "../lib/s3"
import mime from "mime"
import { Request, Response } from "express"

export async function upload(req: Request, res: Response) {
  const filename = req.params.filename
  console.log("Uploading", filename, mime.getType(filename))
  await s3.upload({
    Body: req,
    Bucket: "cdn.bken.io",
    ContentType: mime.getType(filename),
    Key: `tests/hls2/${req.params.filename}`
  }).promise()
  return res.sendStatus(200)
}