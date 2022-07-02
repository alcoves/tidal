import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import { createAdaptiveTranscode, createThumbnail } from '../controllers/videos'

const router = express.Router()

router.post('/thumbnails', apiKeyAuth, createThumbnail)
router.post('/transcodes/adaptive', apiKeyAuth, createAdaptiveTranscode)

export default router
