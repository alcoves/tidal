import cors from 'cors'
import morgan from 'morgan'
import express from 'express'
import jobRoutes from './routes/jobs'
import rootRoutes from './routes/root'
import queueRoutes from './routes/queues'

// bullmq ui
import { basicAuth } from './middlewares/auth'
import { createBullBoard } from '@bull-board/api'
import { ExpressAdapter } from '@bull-board/express'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { transcodeQueue } from './config/queues/transcode'
import { webhookQueue } from './config/queues/webhook'
import { thumbnailQueue } from './config/queues/thumbnail'
import { metadataQueue } from './config/queues/metadata'

const serverAdapter = new ExpressAdapter()

createBullBoard({
  queues: [
    new BullMQAdapter(webhookQueue),
    new BullMQAdapter(metadataQueue),
    new BullMQAdapter(transcodeQueue),
    new BullMQAdapter(thumbnailQueue),
  ],
  serverAdapter: serverAdapter,
})

const app = express()

serverAdapter.setBasePath('/admin/queues')
app.use('/admin/queues', basicAuth, serverAdapter.getRouter())

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))

app.use(rootRoutes)
app.use('/jobs', jobRoutes)
app.use('/queues', queueRoutes)

export default app
