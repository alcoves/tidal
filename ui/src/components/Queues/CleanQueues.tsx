import { Button } from '@chakra-ui/react'
import { useLazyRequest } from '../../hooks/useRequest'

export default function CleanQueues() {
  const [cleanQueue, { loading, data, error }] = useLazyRequest('/queues/clean', { method: 'POST' })

  console.log(loading, data, error)
  return (
    <Button isLoading={loading} onClick={() => cleanQueue()}>
      Clean Queues
    </Button>
  )
}
