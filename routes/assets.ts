import express from "express"
import { createAsset, fetchAsset, fetchAssetManifest } from "../controllers/assets"

const router = express.Router()

// Ordering here matters!
router.get("/:assetId.m3u8", fetchAssetManifest)
router.get("/:assetId", fetchAsset)

router.post("/", createAsset)

export default router