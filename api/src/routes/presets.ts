import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import { putPreset, getPresets } from '../controllers/presets'

const router = express.Router()

router.get('/', apiKeyAuth, getPresets)
router.put('/', apiKeyAuth, putPreset)

export default router
