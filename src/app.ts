import cors from 'cors'
import morgan from 'morgan'
import express from 'express'
import jobRoutes from './routes/jobs'
import rootRoutes from './routes/root'

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))

app.use(rootRoutes)
app.use('/jobs', jobRoutes)

export default app
