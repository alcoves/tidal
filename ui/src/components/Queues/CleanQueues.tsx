import { Button } from '@chakra-ui/react'
import { useLazyRequest } from '../../hooks/useRequest'

export default function CleanQueues() {
  const [cleanQueue, { loading, error }] = useLazyRequest('/queues/clean', { method: 'POST' })
  if (error) alert(error)

  return (
    <Button isLoading={loading} onClick={() => cleanQueue()}>
      Clean Queues
    </Button>
  )
}
