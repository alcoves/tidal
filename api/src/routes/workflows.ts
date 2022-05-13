import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import {
  createWorkflow,
  deleteWorkflow,
  listWorkflows,
  updateWorkflow,
} from '../controllers/workflows'

const router = express.Router()

router.get('/', apiKeyAuth, listWorkflows)
router.post('/', apiKeyAuth, createWorkflow)
router.patch('/:workflowId', apiKeyAuth, updateWorkflow)
router.delete('/:workflowId', apiKeyAuth, deleteWorkflow)

export default router
