import cors from 'cors'
import path from 'path'
import morgan from 'morgan'
import express from 'express'
import jobRoutes from './routes/jobs'
import rootRoutes from './routes/root'
import queueRoutes from './routes/queues'
import settingsRoutes from './routes/settings'

const uiDistDir = path.join(__dirname, '../ui/build')

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))

app.use(rootRoutes)
app.use('/jobs', jobRoutes)
app.use('/queues', queueRoutes)
app.use('/settings', settingsRoutes)

app.use('/ui/static', express.static(`${uiDistDir}/static`))
app.get('/ui(.*)', function (req, res) {
  res.sendFile('index.html', { root: uiDistDir })
})

export default app
