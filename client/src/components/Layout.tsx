import { Outlet, Link, useLocation } from 'react-router-dom'
import { IoBuildSharp, IoHomeSharp, IoVideocamSharp } from 'react-icons/io5'
import { Box, Button, Flex, Heading, Text, VStack } from '@chakra-ui/react'

function SidebarItem({
  to,
  text,
  icon,
  matchExact,
}: {
  to: string
  text: string
  icon: any
  matchExact?: boolean
}) {
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
        leftIcon={icon}
        colorScheme='teal'
        justifyContent='start'
        alignContent='end'
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
        <Flex
          pt='2'
          h='100%'
          minW='200px'
          direction='column'
          justify='space-between'
          borderRightColor='gray.900'
        >
          <Box>
            <SidebarItem icon={<IoHomeSharp size='18px' />} matchExact to='/' text='Home' />
            <SidebarSubText text='workflows' />
            <VStack mt='4' spacing='1'>
              <SidebarItem icon={<IoBuildSharp size='18px' />} to='/workflows' text='Workflows' />
            </VStack>
            <SidebarSubText text='assets' />
            <VStack mt='4' spacing='1'>
              <SidebarItem
                icon={<IoVideocamSharp size='18px' />}
                matchExact
                to='/assets/videos'
                text='Video'
              />
            </VStack>
            <SidebarSubText text='workload' />
            <VStack mt='4' spacing='1'>
              <SidebarItem icon={<IoBuildSharp size='18px' />} to='/queues' text='Queues' />
            </VStack>
            <SidebarSubText text='settings' />
          </Box>
          <Flex p='4' h='100px' align='end' justify='center'>
            <Text fontSize='.8rem'>Tidal 2022</Text>
          </Flex>
        </Flex>
        <Box overflow='scroll' w='100%'>
          <Box minH='calc(100vh - 50px)' p='4' pb='8'>
            <Outlet />
          </Box>
        </Box>
      </Flex>
    </Box>
  )
}
