import express from 'express'
import {
  metadataController,
  thumbnailController,
  transcodeHlsController,
  // transcodeProgressiveController,
} from '../controllers/jobs'

const router = express.Router()

router.post('/metadata', metadataController)
router.post('/thumbnail', thumbnailController)
router.post('/transcode/hls', transcodeHlsController)
// router.post('/transcode/progressive', transcodeProgressiveController)

export default router
