import cors from 'cors'
import morgan from 'morgan'
import express from 'express'
import podRoutes from './routes/pods'
import rootRoutes from './routes/root'
import userRoutes from './routes/users'
import uploadRoutes from './routes/uploads'

const app = express()

app.use(cors())
app.use(morgan('tiny'))
app.use(express.json({ limit: '5mb' }))

app.use(rootRoutes)
app.use('/pods', podRoutes)
app.use('/users', userRoutes)
app.use('/uploads', uploadRoutes)

export default app
