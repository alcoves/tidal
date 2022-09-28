import { Box, Flex, Heading } from '@chakra-ui/react'
import AddJob from './AddJob'

export default function VideoAssets() {
  return (
    <Box>
      <Flex w='100%' align='end' justify='space-between'>
        <Heading size='lg'>Video Assets</Heading>
        <AddJob />
      </Flex>
    </Box>
  )
}
