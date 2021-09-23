
import { Types } from "mongoose"
import { Asset, Rendition, RenditionInterface } from "../models/models"
import { Request, Response } from "express"
import { getMetadata } from "../lib/getMetadata"
import { getRenditions } from "../lib/getRenditions"
import { generateManifest } from "../lib/generateManifest"

export async function createAsset(req: Request, res: Response) {
  const { input } = req.body
  if (!input) return res.sendStatus(400)
  const metadata = await getMetadata(input)
  const assetId = new Types.ObjectId()
  const renditions = getRenditions(metadata, assetId)

  const newAsset = await new Asset({
    _id: assetId,
    input,
    duration: metadata.format.duration,
    renditions: renditions.map((r: RenditionInterface) => r._id)
  }).save()
  await Rendition.insertMany(renditions)

  const asset = await Asset.findOne({
    _id:  new Types.ObjectId(newAsset._id),
  }).populate("renditions").sort("-width")

  res.json({ data: asset })
}

export async function fetchAsset(req: Request, res: Response) {
  const asset = await Asset.findOne({
    _id:  new Types.ObjectId(req.params.assetId),
  }).populate("renditions").sort("-width")
  if (!asset) return res.sendStatus(404)
  return res.json({ data: asset })
}

export async function fetchAssetManifest(req: Request, res: Response) {
  const [assetId] = req.params.assetId.split(".")
  const asset = await Asset.findOne({
    _id: new Types.ObjectId(assetId),
  }).populate("renditions").sort("-width")
  if (!asset) return res.sendStatus(404)
  res.setHeader("content-type", "application/x-mpegURL")
  return res.send(generateManifest(asset).toString())
}