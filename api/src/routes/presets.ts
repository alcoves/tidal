import express from 'express'
import { putPreset, getPresets } from '../controllers/presets'

const router = express.Router()

router.get('/', getPresets)
router.put('/', putPreset)

export default router
