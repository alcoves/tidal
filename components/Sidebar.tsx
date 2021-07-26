
import Link from 'next/link';
import { Text, Box, Flex, Heading } from '@chakra-ui/react';
import { useRouter } from 'next/dist/client/router';
import { IoPieChart, IoLayers, IoOptions } from 'react-icons/io5';

const menu = [
  { title: 'Dashboard', path: '/', icon: IoPieChart },
  { title: 'Jobs', path: '/jobs', icon: IoLayers },
  { title: 'Settings', path: '/settings', icon: IoOptions },
]

export default function Sidebar() {
  const router = useRouter()

  return(
    <Box w='250px' bg='gray.50' h='100vh' boxShadow='lg'>
      <Flex justify='center' align='center' h='60px' bg='gray.200'>
        <Heading size='sm'> Tidal Media Server </Heading>
      </Flex>
      <Flex direction='column' >
        {menu.map((item, index) => {
          const Icon = item.icon
          const bg = router.pathname === item.path ? "gray.100" : "inherit"
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
    </Box>
  )
}