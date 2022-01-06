import { FlowProducer } from 'bullmq'

export const hlsFlowProducer = new FlowProducer({
  connection: {
    port: 6379,
    host: 'localhost',
  },
})
