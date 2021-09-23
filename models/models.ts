import{ Schema, model, Types } from "mongoose"

export interface Asset {
  _id: Types.ObjectId,
  views: number,
  status: string,
  duration: string,
  renditions: Rendition[]
}

export interface Rendition {
  name: string,
  width: number,
  height: number,
  codecs: string
  status: string,
  command: string,
  bandwidth: number,
}

const assetSchama = new Schema<Asset>({
  _id: Types.ObjectId,
  status: String,
  renditions: [],
  duration: String,
  views: { type: Number, default: 0 },
}, { timestamps: true })

export const Asset = model<Asset>("Assets", assetSchama)
