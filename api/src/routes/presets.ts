import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import { createPreset, deletePreset, listPresets, updatePreset } from '../controllers/presets'

const router = express.Router()

router.get('/', apiKeyAuth, listPresets)
router.post('/', apiKeyAuth, createPreset)
router.patch('/:presetId', apiKeyAuth, updatePreset)
router.delete('/:presetId', apiKeyAuth, deletePreset)

export default router
