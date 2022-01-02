import http from 'http'
import app from './app'
import db from './config/db'
import { Server } from 'socket.io'

const port = 5000
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
  },
})

app.set('io', io)

async function main() {
  server.listen(port, () => {
    console.log(`listening on *:${port}`)
  })
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await db.$disconnect()
  })
