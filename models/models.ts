import mongoose from "mongoose"

export const TidalVideo = mongoose.model("TidalVideo", new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  status: String,
  duration: String,
  views: { type: Number, default: 0 },
  renditions: { type : mongoose.Types.ObjectId, ref: "TidalRendition" },
}, { timestamps: true }))

export const TidalRendition = mongoose.model("TidalRendition", new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  status: String,
  command: String,
}, { timestamps: true }))