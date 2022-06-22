import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import { createAsset } from '../controllers/assets'

const router = express.Router()

router.post('/', apiKeyAuth, createAsset)

export default router
