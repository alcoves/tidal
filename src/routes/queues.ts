import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import { cleanQueues, getQueueJobs, retryFailedJobs } from '../controllers/queues'

const router = express.Router()

router.delete('/clean', apiKeyAuth, cleanQueues)
router.get('/:queueId/jobs', apiKeyAuth, getQueueJobs)
router.put('/:queueId/failed', apiKeyAuth, retryFailedJobs)

export default router
