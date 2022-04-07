import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { useRequest } from '../hooks/useRequest'
import { Queue } from '../types'
import QueueCard from './QueueCard'
import CleanQueues from './Queues/CleanQueues'

export default function Queues() {
  const { data, error } = useRequest('/queues')

  if (data) {
    return (
      <Box>
        <Box mb='2'>
          <Heading mb='2'>Queues</Heading>
          <CleanQueues />
        </Box>
        <Stack>
          {data?.queues?.map((queue: Queue) => {
            return <QueueCard key={queue.name} queue={queue} />
          })}
        </Stack>
        {error && <pre>{JSON.stringify(error, null, 2)}</pre>}
      </Box>
    )
  }

  return <Text>Loading...</Text>
}
