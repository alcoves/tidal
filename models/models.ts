import{ Schema, model, Types } from "mongoose"

export interface AssetInterface {
  _id: Types.ObjectId,
  views: number,
  input: string,
  status: string,
  duration: string,
  renditions: RenditionInterface[]
}

export interface RenditionInterface {
  _id: Types.ObjectId,
  name: string,
  width: number,
  height: number,
  codecs: string
  status: string,
  command: string,
  bandwidth: number,
  asset: AssetInterface,
}

const assetSchama = new Schema<AssetInterface>({
  _id: Types.ObjectId,
  input: String,
  status: String,
  duration: String,
  views: { type: Number, default: 0 },
  renditions: [{ type: Schema.Types.ObjectId, ref: "Rendition" }],
}, { timestamps: true })

const renditionSchema = new Schema<RenditionInterface>({
  _id: Types.ObjectId,
  name: String,
  width: Number,
  height: Number,
  codecs: String,
  status: String,
  command: String,
  bandwidth: String,
  asset: { type: Schema.Types.ObjectId, ref: "Asset" },
}, { timestamps: true })

export const Asset = model<AssetInterface>("Asset", assetSchama)
export const Rendition = model<RenditionInterface>("Rendition", renditionSchema)
