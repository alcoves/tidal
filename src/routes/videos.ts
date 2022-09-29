import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import {
  getVideo,
  listVideos,
  createVideo,
  createMetadata,
  createThumbnail,
  adaptiveTranscodeHandler,
} from '../controllers/videos'

const router = express.Router()

router.get('/', apiKeyAuth, listVideos)
router.post('/', apiKeyAuth, createVideo)
router.get('/:videoId', apiKeyAuth, getVideo)
router.post('/metadata', apiKeyAuth, createMetadata)
router.post('/thumbnails', apiKeyAuth, createThumbnail)
router.post('/transcodes/adaptive', apiKeyAuth, adaptiveTranscodeHandler)

export default router
