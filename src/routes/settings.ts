import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import { getSettings, setSettings } from '../controllers/settings'

const router = express.Router()

router.get('/', apiKeyAuth, getSettings)
router.put('/', apiKeyAuth, setSettings)

export default router
