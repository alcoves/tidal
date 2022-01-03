import express from 'express'
import { metadataController, transcodeController, thumbnailController } from '../controllers/jobs'

const router = express.Router()

router.post('/metadata', metadataController)
router.post('/transcode', transcodeController)
router.post('/thumbnail', thumbnailController)

export default router
