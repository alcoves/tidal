import dotenv from 'dotenv'
dotenv.config({ path: './.env.test' })

import app from '../app'
import request from 'supertest'

describe('root', () => {
  test('GET /', async () => {
    await request(app).get('/').expect(200)
  })
})
