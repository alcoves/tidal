import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import {
  getQueue,
  listQueues,
  cleanQueues,
  getQueueJob,
  retryFailedJobs,
} from '../controllers/queues'

const router = express.Router()

router.get('/', apiKeyAuth, listQueues)
router.get('/:queueName', apiKeyAuth, getQueue)
router.get('/:queueName/jobs/:jobId', apiKeyAuth, getQueueJob)

// May not use
router.delete('/clean', apiKeyAuth, cleanQueues)
router.put('/:queueName/failed', apiKeyAuth, retryFailedJobs)

export default router
