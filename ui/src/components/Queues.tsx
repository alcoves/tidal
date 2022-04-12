import useSWR from 'swr'
import {
  Box,
  Button,
  Heading,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Queue } from '../types'
import { fetcher } from '../utils/fetcher'
import QueueCard from './QueueCard'
import CleanQueues from './Queues/CleanQueues'
import { useState } from 'react'

export default function Queues() {
  const [refreshInterval, setRefreshInterval] = useState(0)
  const { data, error, mutate } = useSWR('/queues', fetcher, { refreshInterval })

  function handleRefreshInterval(e) {
    setRefreshInterval(e.target.value)
    mutate()
  }

  if (data) {
    return (
      <Box>
        <Box mb='2'>
          <Heading mb='2'>Queues</Heading>
          <HStack justify='end'>
            <CleanQueues />
            <Menu>
              <MenuButton as={Button}>
                {refreshInterval ? `${refreshInterval / 1000}s` : 'Refresh'}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={handleRefreshInterval} value={1000}>
                  1s
                </MenuItem>
                <MenuItem onClick={handleRefreshInterval} value={1000 * 5}>
                  5s
                </MenuItem>
                <MenuItem onClick={handleRefreshInterval} value={1000 * 10}>
                  10s
                </MenuItem>
                <MenuItem onClick={handleRefreshInterval} value={1000 * 30}>
                  30s
                </MenuItem>
                <MenuItem onClick={handleRefreshInterval} value={1000 * 60}>
                  1m
                </MenuItem>
                <MenuItem onClick={handleRefreshInterval} value={1000 * 300}>
                  5m
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
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
