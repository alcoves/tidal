import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import { cleanQueues, deleteQueue, createQueue, listQueues } from '../controllers/queues'

const router = express.Router()

router.get('/', apiKeyAuth, listQueues)
router.post('/', apiKeyAuth, createQueue)
router.post('/clean', apiKeyAuth, cleanQueues)
router.delete('/:queueId', apiKeyAuth, deleteQueue)

export default router
