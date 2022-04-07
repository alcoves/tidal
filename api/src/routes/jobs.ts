import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import {
  createManifest,
  metadataController,
  thumbnailController,
  transcodeHlsController,
} from '../controllers/jobs'

const router = express.Router()

router.post('/manifest', apiKeyAuth, createManifest)
router.post('/metadata', apiKeyAuth, metadataController)
router.post('/thumbnail', apiKeyAuth, thumbnailController)
router.post('/transcode/hls', apiKeyAuth, transcodeHlsController)

export default router
