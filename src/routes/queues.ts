import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import { cleanQueues, getQueue, retryFailedJobs } from '../controllers/queues'

const router = express.Router()

router.get('/:queueId', apiKeyAuth, getQueue)
router.delete('/clean', apiKeyAuth, cleanQueues)
router.put('/:queueId/failed', apiKeyAuth, retryFailedJobs)

export default router
