import express from 'express'
import { getMainPlayback } from '../controllers/play'

const router = express.Router()

router.get('/:playbackId', getMainPlayback)

export default router
