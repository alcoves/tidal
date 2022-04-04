import { Box, Flex, Heading } from '@chakra-ui/react'

export function App() {
  return (
    <Box>
      <Flex p='2' h='50px' align='center' bg='brand.yellow'>
        <Heading size='md' color='brand.gray'>
          Tidal UI
        </Heading>
      </Flex>
      <Flex>
        <Box
          p='2'
          w='200px'
          h='calc(100vh - 50px)'
          borderRightWidth='1px'
          borderRightStyle='solid'
          borderRightColor='gray.700'
        >
          sidebar
        </Box>
        <Box p='2'>Content</Box>
      </Flex>
    </Box>
  )
}
