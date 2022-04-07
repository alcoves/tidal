import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import { getQueues, cleanQueues } from '../controllers/queues'

const router = express.Router()

router.get('/', apiKeyAuth, getQueues)
router.post('/clean', apiKeyAuth, cleanQueues)

export default router
