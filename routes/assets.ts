import express from "express"
import { auth } from "../middlewares/auth"
import { createAsset, deleteAsset, fetchAsset, fetchAssetManifest } from "../controllers/assets"

const router = express.Router()

// Ordering here matters!
router.get("/:assetId.m3u8", fetchAssetManifest) // This is a public endpoint
router.get("/:assetId", auth,  fetchAsset)
router.delete("/:assetId", auth, deleteAsset)

router.post("/", auth, createAsset)

export default router