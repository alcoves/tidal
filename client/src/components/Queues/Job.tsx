import QueryError from '../QueryError'
import { Box, Heading } from '@chakra-ui/react'
import { getJob } from '../../services/api'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

export default function Job() {
  const { queueName, jobId } = useParams()
  const { data, error } = useQuery([queueName, jobId], getJob)

  if (data) {
    return (
      <Box>
        <Heading size='lg'>
          Job:{data?.job?.name}:{data?.job?.id}
        </Heading>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </Box>
    )
  }

  if (error) return <QueryError error={error} />
  return null
}
