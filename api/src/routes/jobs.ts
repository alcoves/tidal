import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import { createManifest, metadataController, transcodeController } from '../controllers/jobs'

const router = express.Router()

router.post('/manifest', apiKeyAuth, createManifest)
router.post('/metadata', apiKeyAuth, metadataController)
router.post('/transcode', apiKeyAuth, transcodeController)

export default router
