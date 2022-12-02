import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import { createVideo } from '../controllers/videos/createVideo'
import { getVideo, listVideos, deleteVideo, createVideoUploadLink } from '../controllers/videos'

const router = express.Router()

router.get('/', apiKeyAuth, listVideos)
router.post('/', apiKeyAuth, createVideo)
router.get('/:videoId', apiKeyAuth, getVideo)
router.delete('/:videoId', apiKeyAuth, deleteVideo)
router.post('/uploads', apiKeyAuth, createVideoUploadLink)

export default router
