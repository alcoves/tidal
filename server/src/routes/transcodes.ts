import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import { createTranscode } from '../controllers/transcodes'

const router = express.Router()

router.post('/', apiKeyAuth, createTranscode)

export default router
