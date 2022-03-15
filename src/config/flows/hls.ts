import { FlowProducer } from 'bullmq'
import { defaultConnection } from '../redis'

export const hlsFlowProducer = new FlowProducer({
  connection: defaultConnection,
})
