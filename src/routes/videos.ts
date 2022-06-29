import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import { createVideo, createThumbnail } from '../controllers/videos'

const router = express.Router()

router.post('/', apiKeyAuth, createVideo)
router.post('/thumbnails', apiKeyAuth, createThumbnail)

export default router
