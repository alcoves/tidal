import { FlowProducer } from 'bullmq'
import { connection } from './connection'

export const flowProducer = new FlowProducer({
  connection,
})
