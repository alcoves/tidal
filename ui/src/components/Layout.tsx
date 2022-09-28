import { Outlet, Link, useLocation } from 'react-router-dom'
import { Box, Button, Flex, Heading, Text, VStack } from '@chakra-ui/react'

function SidebarItem({ to, text }: { to: string; text: string }) {
  const location = useLocation()

  // matches first route level
  const isActive = location.pathname.split('/')[1] === to.split('/')[1]

  return (
    <Flex cursor='pointer' w='100%' h='30px' align='center' pl='4'>
      <Button w='100%' to={to} as={Link} colorScheme='teal' variant={isActive ? 'solid' : 'ghost'}>
        {text}
      </Button>
    </Flex>
  )
}

export default function Layout() {
  return (
    <Box h='calc(100vh - 50px)' w='100vw'>
      <Flex bg='teal.500' justify='space-between' h='50px'>
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
        <Box w='200px' h='100%'>
          <VStack mt='4' spacing='4'>
            <SidebarItem to='/' text='Home' />
            <SidebarItem to='/jobs' text='Jobs' />
          </VStack>
        </Box>
        <Box w='100%' p='4'>
          <Outlet />
        </Box>
      </Flex>
    </Box>
  )
}
