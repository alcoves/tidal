import AddJob from './AddJob'

import { useQuery } from '@tanstack/react-query'
import { getVideos } from '../services/getVideos'
import { Box, Flex, Heading, Text } from '@chakra-ui/react'

export default function VideoAssets() {
  const { data } = useQuery(['videos'], getVideos)

  return (
    <Box>
      <Flex w='100%' align='end' justify='space-between'>
        <Heading size='lg'>Video Assets</Heading>
        <AddJob />
      </Flex>
      <Box pt='4'>
        {data?.videos?.map((v: any) => {
          return (
            <Flex>
              <Text>{v.id}</Text>
              <Text>{v.input}</Text>
            </Flex>
          )
        })}
      </Box>
    </Box>
  )
}
