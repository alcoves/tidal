import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import {
  getRendition,
  listRenditions,
  createRendition,
  updateRendition,
  deleteRendition,
} from '../controllers/renditions'

const router = express.Router()

router.get('/', apiKeyAuth, listRenditions)
router.post('/', apiKeyAuth, createRendition)

router.get('/:renditionId', apiKeyAuth, getRendition)
router.patch('/:renditionId', apiKeyAuth, updateRendition)
router.delete('/:renditionId', apiKeyAuth, deleteRendition)

export default router
