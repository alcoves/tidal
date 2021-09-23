
import mongoose from "mongoose"
import { Asset } from "../models/models"
import { Request, Response } from "express"
import { getMetadata } from "../lib/getMetadata"
import { getRenditions } from "../lib/getRenditions"
import { generateManifest } from "../lib/generateManifest"

export async function createAsset(req: Request, res: Response) {
  const { input } = req.body
  if (!input) return res.sendStatus(400)
  const metadata = await getMetadata(input)

  const asset = await new Asset({
    _id: new mongoose.Types.ObjectId(),
    duration: metadata.format.duration,
    renditions: getRenditions(metadata)
  }).save()

  res.json({ data: asset })
}

export async function fetchAsset(req: Request, res: Response) {
  const asset = await Asset.findOne({
    _id:  new mongoose.Types.ObjectId(req.params.assetId),
  })
  if (!asset) res.sendStatus(404)
  return res.sendStatus(400)
}

export async function fetchAssetManifest(req: Request, res: Response) {
  const [assetId, extention] = req.params.assetId.split(".")
  if (extention === "m3u8") {
    const video = await Asset.findOne({
      _id:  new mongoose.Types.ObjectId(assetId),
    })
    if (!video) res.sendStatus(404)
    console.log("returning manifest")
    res.setHeader("content-type", "application/x-mpegURL")
    return res.send(generateManifest().toString())
  }
  return res.sendStatus(400)
}