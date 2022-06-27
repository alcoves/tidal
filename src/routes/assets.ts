import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import { createAsset, createAssetThumbnail } from '../controllers/assets'

const router = express.Router()

router.post('/', apiKeyAuth, createAsset)
router.post('/:assetId/thumbnail', apiKeyAuth, createAssetThumbnail)

export default router
