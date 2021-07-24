
import { Box, Flex, Heading, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';

const menu = [
  { title: 'Dashboard', path: '/' },
  { title: 'Jobs', path: '/jobs' },
  { title: 'Settings', path: '/settings' },
]

export default function Sidebar() {
  const router = useRouter()

  return(
    <Box w='250px' bg='gray.200' h='100vh' boxShadow='lg'>
      <Flex justify='center' align='center' h='60px' bg='gray.300'>
        <Heading size='sm'> Tidal Media Server </Heading>
      </Flex>
      <Flex direction='column' >
        {menu.map((item, index) => {
          const bg = router.pathname === item.path ? "gray.300" : "inherit"
          return (
            <Link key={index} href={item.path} passHref>
              <Flex align='center' bg={bg} w='100%' minH='50px' pl='2' cursor='pointer'>
                {item.title}
              </Flex>
            </Link>
          )
        })}
      </Flex>
    </Box>
  )
}