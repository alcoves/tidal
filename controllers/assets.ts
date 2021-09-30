
import { Types } from "mongoose"
import { deleteFolder } from "../lib/s3"
import { Request, Response } from "express"
import { getMetadata } from "../lib/getMetadata"
import { getRenditions } from "../lib/getRenditions"
import { createThumbnail } from "../lib/createThumbnail"
import { generateManifest } from "../lib/generateManifest"
import { Asset, Rendition, RenditionInterface } from "../models/models"

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

  await createThumbnail(input, {
    Bucket: process.env.S3_BUCKET,
    Key: `v/${assetId}/thumbnail.jpg`
  })

  res.json({ data: asset })
}

export async function recomputeRenditions(req: Request, res: Response) {
  const assets = await Asset.find()

  for (const asset of assets) {
    const oldRenditions = await Rendition.find({ asset: asset._id })

    for (const oldRendition of oldRenditions) {
      console.log(oldRendition, `v/${asset._id}/${oldRendition._id.toString()}`)
      await deleteFolder({
        Bucket: process.env.S3_BUCKET,
        Prefix: `v/${asset._id}/${oldRendition._id.toString()}`
      })
      const res = await oldRendition.delete()
      console.log(res)
    }
  
    const metadata = await getMetadata(asset.input)
    const renditions = getRenditions(metadata, asset._id)
    await Rendition.insertMany(renditions)
    await Asset.findByIdAndUpdate(asset._id, { $set: { renditions: renditions.map((r: RenditionInterface) => r._id) } })
  }

  return res.sendStatus(200)
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
  const manifest = await generateManifest(asset).toString()
  return res.send(manifest)
}

export async function deleteAsset(req: Request, res: Response) {
  const { assetId } = req.params
  const asset = await Asset.findOne({ _id: assetId })
  if (asset) {
    await Asset.deleteOne({ _id: asset._id })
    await Rendition.deleteMany({ asset: asset._id })
    await deleteFolder({
      Bucket: process.env.S3_BUCKET,
      Prefix: `v/${asset._id}`
    })
  }
  return res.sendStatus(200)
}