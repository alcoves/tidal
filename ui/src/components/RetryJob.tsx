import { Button } from '@chakra-ui/react'
import { retryJob } from '../services/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function RetryJob({
  jobId,
  videoId,
  queueName,
}: {
  jobId: string
  videoId: string
  queueName: string
}) {
  const queryClient = useQueryClient()

  const mutation = useMutation(retryJob, {
    onSuccess: () => {
      queryClient.invalidateQueries([videoId])
    },
  })

  function handleSubmit() {
    mutation.mutate({ queueName, jobId })
  }

  return <Button onClick={handleSubmit}>Retry</Button>
}
