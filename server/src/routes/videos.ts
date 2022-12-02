import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import {
  getVideo,
  listVideos,
  deleteVideo,
  startVideoProcessing,
  createVideoUploadLink,
} from '../controllers/videos'
import { renderVideoPlayer } from '../controllers/play'

const router = express.Router()

router.get('/:videoId/play', renderVideoPlayer)

router.get('/', apiKeyAuth, listVideos)
router.get('/:videoId', apiKeyAuth, getVideo)
router.delete('/:videoId', apiKeyAuth, deleteVideo)
router.post('/uploads', apiKeyAuth, createVideoUploadLink)
router.post('/:videoId', apiKeyAuth, startVideoProcessing)

export default router
