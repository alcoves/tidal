import express from 'express'
import { getQueues } from '../controllers/queues'
import { apiKeyAuth } from '../middlewares/auth'

const router = express.Router()

router.get('/', apiKeyAuth, getQueues)

export default router
