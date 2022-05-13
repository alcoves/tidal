import cors from 'cors'
import path from 'path'
import morgan from 'morgan'
import express from 'express'
import jobRoutes from './routes/jobs'
import rootRoutes from './routes/root'
import queueRoutes from './routes/queues'
import workflowRoutes from './routes/workflows'
import settingsRoutes from './routes/settings'
import renditionsRoutes from './routes/renditions'

const uiDistDir = path.join(__dirname, '../../dist/ui')

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))

app.use(rootRoutes)
app.use('/jobs', jobRoutes)
app.use('/queues', queueRoutes)
app.use('/workflows', workflowRoutes)
app.use('/settings', settingsRoutes)
app.use('/renditions', renditionsRoutes)

app.use('/ui', express.static(`${uiDistDir}`))
app.get('/ui(.*)', function (req, res) {
  res.sendFile('index.html', { root: uiDistDir })
})

export default app
