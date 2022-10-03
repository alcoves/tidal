import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import {
  getVideo,
  listVideos,
  deleteVideo,
  createVideo,
  createMetadata,
  createThumbnail,
  adaptiveTranscodeHandler,
} from '../controllers/videos'

const router = express.Router()

router.get('/', apiKeyAuth, listVideos)
router.post('/', apiKeyAuth, createVideo)
router.get('/:videoId', apiKeyAuth, getVideo)
router.delete('/:videoId', apiKeyAuth, deleteVideo)
router.post('/metadata', apiKeyAuth, createMetadata)
router.post('/:videoId/thumbnails', apiKeyAuth, createThumbnail)
router.post('/transcodes/adaptive', apiKeyAuth, adaptiveTranscodeHandler)

export default router
