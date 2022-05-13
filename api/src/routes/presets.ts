import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import {
  getPreset,
  listPresets,
  createPreset,
  updatePreset,
  deletePreset,
} from '../controllers/presets'

const router = express.Router()

router.get('/', apiKeyAuth, listPresets)
router.post('/', apiKeyAuth, createPreset)

router.get('/:presetId', apiKeyAuth, getPreset)
router.patch('/:presetId', apiKeyAuth, updatePreset)
router.delete('/:presetId', apiKeyAuth, deletePreset)

export default router
