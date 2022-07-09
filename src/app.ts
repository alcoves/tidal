import cors from 'cors'
import morgan from 'morgan'
import express from 'express'
import rootRoutes from './routes/root'
import videoRoutes from './routes/videos'
import queueRoutes from './routes/queues'

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))

app.use(rootRoutes)
app.use('/queues', queueRoutes)
app.use('/videos', videoRoutes)

export default app
