import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import { adaptiveTranscode, createMetadata, createThumbnail } from '../controllers/videos'

const router = express.Router()

router.post('/metadata', apiKeyAuth, createMetadata)
router.post('/thumbnails', apiKeyAuth, createThumbnail)
router.post('/transcodes/adaptive', apiKeyAuth, adaptiveTranscode)

export default router
