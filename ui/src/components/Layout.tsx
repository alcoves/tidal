import { Box, Flex, Heading, Text } from '@chakra-ui/react'
import { Outlet, Link } from 'react-router-dom'

function Layout() {
  return (
    <Box h='calc(100vh - 50px)' w='100vw'>
      <Flex borderBottom='solid grey 1px' justify='space-between' h='50px'>
        <Flex w='200px' align='center' pl='2'>
          <Heading size='md'>Tidal</Heading>
        </Flex>
        <Flex align='center' pr='2'>
          <Text>
            <Link to='/settings/tokens'>Tokens</Link>
          </Text>
        </Flex>
      </Flex>
      <Flex w='100%' h='100%'>
        <Box borderRight='solid grey 1px' w='200px' h='100%'>
          <Flex cursor='pointer' w='100%' h='30px' align='center' pl='4'>
            <Text>
              <Link to='/'>Home</Link>
            </Text>
          </Flex>
          <Flex cursor='pointer' w='100%' h='30px' align='center' pl='4'>
            <Text>
              <Link to='/jobs'>Jobs</Link>
            </Text>
          </Flex>
        </Box>
        <Box w='100%' p='4'>
          <Outlet />
        </Box>
      </Flex>
    </Box>
  )
}

export default Layout
