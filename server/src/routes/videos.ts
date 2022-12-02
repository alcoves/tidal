import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import {
  getVideo,
  listVideos,
  deleteVideo,
  startVideoProcessing,
  createVideoUploadLink,
} from '../controllers/videos'

const router = express.Router()

router.get('/', apiKeyAuth, listVideos)
router.get('/:videoId', apiKeyAuth, getVideo)
router.delete('/:videoId', apiKeyAuth, deleteVideo)
router.post('/uploads', apiKeyAuth, createVideoUploadLink)
router.post('/:videoId', apiKeyAuth, startVideoProcessing)

export default router
