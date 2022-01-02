import cors from 'cors'
import morgan from 'morgan'
import express from 'express'
import rootRoutes from './routes/root'
import videoRoutes from './routes/videos'
import uploadRoutes from './routes/uploads'

const app = express()

app.use(cors())
app.use(morgan('tiny'))

app.use(rootRoutes)
app.use('/videos', videoRoutes)
app.use('/uploads', uploadRoutes)

export default app
