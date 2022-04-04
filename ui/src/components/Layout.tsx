import Sidebar from './Sidebar'
import { Box, Flex, Heading } from '@chakra-ui/react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box>
      <Flex p='2' h='50px' align='center' bg='brand.yellow'>
        <Heading size='md' color='brand.gray'>
          Tidal UI
        </Heading>
      </Flex>
      <Flex>
        <Sidebar />
        <Box p='2'>{children}</Box>
      </Flex>
    </Box>
  )
}
