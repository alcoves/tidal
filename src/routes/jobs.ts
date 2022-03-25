import express from 'express'
import {
  createManifest,
  metadataController,
  thumbnailController,
  transcodeHlsController,
  // transcodeProgressiveController,
} from '../controllers/jobs'
import { apiKeyAuth } from '../middlewares/auth'

const router = express.Router()

router.post('/manifest', apiKeyAuth, createManifest)
router.post('/metadata', apiKeyAuth, metadataController)
router.post('/thumbnail', apiKeyAuth, thumbnailController)
router.post('/transcode/hls', apiKeyAuth, transcodeHlsController)

// router.post('/transcode/progressive', transcodeProgressiveController)

export default router
