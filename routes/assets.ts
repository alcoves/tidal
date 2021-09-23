import express from "express"
import { createAsset, deleteAsset, fetchAsset, fetchAssetManifest } from "../controllers/assets"

const router = express.Router()

// Ordering here matters!
router.get("/:assetId.m3u8", fetchAssetManifest)
router.get("/:assetId", fetchAsset)
router.delete("/:assetId", deleteAsset)

router.post("/", createAsset)

export default router