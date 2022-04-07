import { Queue } from '../types'
import { Flex, Heading, HStack, Text } from '@chakra-ui/react'

export default function QueueCard({ queue }: { queue: Queue }) {
  return (
    <Flex bg='gray.700' p='4' rounded='md' direction='column'>
      <Heading size='lg' textTransform='uppercase'>
        {queue.name}
      </Heading>
      <HStack spacing={6}>
        {Object.entries(queue.metrics.jobs).map(([key, value]) => {
          return (
            <Flex key={key} direction='column'>
              <Heading size='lg'>{value}</Heading>
              <Text textTransform='uppercase'>{key}</Text>
            </Flex>
          )
        })}
      </HStack>
    </Flex>
  )
}
