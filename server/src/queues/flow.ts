import { FlowProducer } from 'bullmq'
import { connection } from './connection'

export function flow() {
  return new FlowProducer({
    connection,
  })
}
