import cors from 'cors'
import path from 'path'
import morgan from 'morgan'
import express from 'express'
import rootRoutes from './routes/root'
import settingsRoutes from './routes/settings'
import workflowRoutes from './routes/workflows'

const uiDistDir = path.join(__dirname, '../../dist/ui')

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))

app.use(rootRoutes)
app.use('/settings', settingsRoutes)
app.use('/workflows', workflowRoutes)

app.use('/ui', express.static(`${uiDistDir}`))
app.get('/ui(.*)', function (req, res) {
  res.sendFile('index.html', { root: uiDistDir })
})

export default app
