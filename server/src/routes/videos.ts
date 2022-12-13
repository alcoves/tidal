import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import { getVideo, createVideo } from '../controllers/videos'

const router = express.Router()

router.post('/', apiKeyAuth, createVideo)
router.get('/:videoId', apiKeyAuth, getVideo)

export default router
