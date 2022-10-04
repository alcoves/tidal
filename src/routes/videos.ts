import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import {
  getVideo,
  listVideos,
  deleteVideo,
  createVideo,
  createThumbnail,
  createTranscode,
} from '../controllers/videos'

const router = express.Router()

router.get('/', apiKeyAuth, listVideos)
router.post('/', apiKeyAuth, createVideo)
router.get('/:videoId', apiKeyAuth, getVideo)
router.delete('/:videoId', apiKeyAuth, deleteVideo)
router.post('/:videoId/thumbnails', apiKeyAuth, createThumbnail)
router.post('/:videoId/transcodes', apiKeyAuth, createTranscode)
// router.post('/:videoId/transcodes/:transcodeId/retry', apiKeyAuth, retryTranscode)

export default router
