import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import {
  getVideo,
  listVideos,
  deleteVideo,
  createVideo,
  createRendition,
} from '../controllers/videos'

const router = express.Router()

router.get('/', apiKeyAuth, listVideos)
router.post('/', apiKeyAuth, createVideo)
router.get('/:videoId', apiKeyAuth, getVideo)
router.delete('/:videoId', apiKeyAuth, deleteVideo)

router.post('/:videoId/renditions', apiKeyAuth, createRendition)

export default router
