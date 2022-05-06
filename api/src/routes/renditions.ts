import express from 'express'
import {
  listRenditions,
  createRendition,
  updateRendition,
  deleteRendition,
} from '../controllers/renditions'

const router = express.Router()

router.get('/', listRenditions)
router.post('/', createRendition)
router.patch('/:renditionId', updateRendition)
router.delete('/:renditionId', deleteRendition)

export default router
