import { FlowProducer } from 'bullmq'
import { defaultConnection } from '../redis'

export const transcodeFlowProducer = new FlowProducer({
  connection: defaultConnection,
})
