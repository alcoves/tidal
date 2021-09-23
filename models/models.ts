import{ Schema, model, Types } from "mongoose"

export interface Asset {
  _id: Types.ObjectId,
  status: string,
  duration: string,
  views: number,
  renditions: Rendition[]
}

export interface Rendition {
  status: string,
  name: string,
  width: number,
  height: number,
  codecs: string
  bandwidth: number,

  command: string,
}

const assetSchama = new Schema<Asset>({
  _id: Types.ObjectId,
  status: String,
  duration: String,
  renditions: [],
  views: { type: Number, default: 0 },
}, { timestamps: true })

export const Asset = model<Asset>("Assets", assetSchama)
