import { Outlet, Link, useLocation } from 'react-router-dom'
import { Box, Button, Flex, Heading, Text, VStack } from '@chakra-ui/react'

function SidebarItem({ to, text, matchExact }: { to: string; text: string; matchExact?: boolean }) {
  const location = useLocation()
  const isActive = matchExact
    ? location.pathname === to
    : location.pathname.split('/')[1] === to.split('/')[1]

  return (
    <Flex cursor='pointer' w='100%' align='center' px='1'>
      <Button
        to={to}
        w='100%'
        as={Link}
        colorScheme='teal'
        justifyContent='start'
        variant={isActive ? 'solid' : 'ghost'}
      >
        {text}
      </Button>
    </Flex>
  )
}

function SidebarSubText({ text }: { text: string }) {
  return (
    <Heading pl='2' my='4' fontSize='.7rem' color='gray.500' textTransform='uppercase'>
      {text}
    </Heading>
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
        <Box w='200px' h='100%' pt='2'>
          <SidebarItem matchExact to='/' text='Home' />
          <SidebarSubText text='assets' />
          <VStack mt='4' spacing='1'>
            <SidebarItem matchExact to='/assets/images' text='Images' />
            <SidebarItem matchExact to='/assets/videos' text='Video' />
          </VStack>
          <SidebarSubText text='workload' />
          <VStack mt='4' spacing='1'>
            <SidebarItem to='/jobs' text='Jobs' />
          </VStack>
          <SidebarSubText text='settings' />
        </Box>
        <Box w='100%' p='4'>
          <Outlet />
        </Box>
      </Flex>
    </Box>
  )
}
