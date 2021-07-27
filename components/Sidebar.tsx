
import Link from 'next/link'
import { Text, Box, Flex, Heading } from '@chakra-ui/react'
import { useRouter } from 'next/dist/client/router'
// import { useSwr } from 'swr';
import { IoPieChart, IoLayers, IoOptions, IoEllipse } from 'react-icons/io5'

const menu = [
  { title: 'Dashboard', path: '/', icon: IoPieChart },
  { title: 'Jobs', path: '/jobs', icon: IoLayers },
  { title: 'Settings', path: '/settings', icon: IoOptions }
]

const colors = {
  healthy: '#179848',
  unhealthy: '#bf1e2e'
}

export default function Sidebar () {
  const router = useRouter()

  return (
    <Flex w='250px' bg='gray.50' h='100vh' boxShadow='lg' justify='space-between' direction='column'>
      <Flex direction='column'>
      <Flex justify='center' align='center' h='60px' bg='gray.200'>
        <Heading size='sm'> Tidal Media Server </Heading>
      </Flex>
      <Flex direction='column' >
        {menu.map((item, index) => {
          const Icon = item.icon
          const bg = router.pathname === item.path ? 'gray.100' : 'inherit'
          return (
            <Link key={index} href={item.path} passHref>
              <Flex align='center' bg={bg} w='100%' minH='50px' pl='2' cursor='pointer'>
                <Box p='5' >
                  <Icon />
                </Box>
                <Box>
                  <Text>{item.title}</Text>
                </Box>
              </Flex>
            </Link>
          )
        })}
      </Flex>
      </Flex>
      <Flex h='60px'>
        <Flex w='50%' justify='center' direction='column' align='center'>
          <IoEllipse color={colors.healthy}/>
          <Text fontSize='.8rem' textTransform='uppercase'>Nomad</Text>
        </Flex>
        <Flex w='50%' justify='center' direction='column' align='center'>
          <IoEllipse color={colors.unhealthy}/>
          <Text fontSize='.8rem' textTransform='uppercase'>Consul</Text>
        </Flex>
      </Flex>
    </Flex>
  )
}
