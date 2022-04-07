import { Box, Stack, Text } from '@chakra-ui/react'
import { useRequest } from '../hooks/useRequest'
import { Queue } from '../types'
import QueueCard from './QueueCard'

export default function Queues() {
  const { loading, data, error } = useRequest('/queues')

  if (loading) {
    return <Text>Loading...</Text>
  }

  return (
    <Box>
      <Stack>
        {data?.queues.map((queue: Queue) => {
          return <QueueCard key={queue.name} queue={queue} />
        })}
      </Stack>
      {error && <pre>{JSON.stringify(error, null, 2)}</pre>}
    </Box>
  )
}
