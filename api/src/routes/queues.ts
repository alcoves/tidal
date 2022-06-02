import express from 'express'
import { apiKeyAuth } from '../middlewares/auth'
import { fetchQueues, cleanQueues } from '../controllers/queues'

const router = express.Router()

router.get('/', apiKeyAuth, fetchQueues)
router.post('/clean', apiKeyAuth, cleanQueues)

export default router
