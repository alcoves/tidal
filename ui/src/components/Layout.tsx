import Sidebar from './Sidebar'
import { Box, Flex, Heading } from '@chakra-ui/react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box>
      <Flex p='2' h='50px' align='center' bg='yellow.500'>
        <Heading size='md' color='gray.800'>
          Tidal UI
        </Heading>
      </Flex>
      <Flex>
        <Sidebar />
        <Box p='2' w='100%'>
          {children}
        </Box>
      </Flex>
    </Box>
  )
}
