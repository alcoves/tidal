import { FlowProducer } from 'bullmq'

export const hlsFlowProducer = new FlowProducer({
  connection: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
})
