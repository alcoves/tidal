import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
// import { ffprobeController, getTranscodeJobs, transcodeController } from '../controllers/jobs'

const router = express.Router()

// router.post('/probe', apiKeyAuth, ffprobeController)
// router.get('/transcode', apiKeyAuth, getTranscodeJobs)
// router.post('/transcode', apiKeyAuth, transcodeController)

export default router
