import { Flex, Box, useColorMode, IconButton } from '@chakra-ui/react';
import Link from 'next/link';
import { IoOptionsOutline, IoGrid, IoSunnyOutline, IoSunny } from 'react-icons/io5';

export default function NavBar() {
  const { colorMode, toggleColorMode } = useColorMode()
  return (
    <Flex h='calc(100vh - 20px)' justifyContent='space-between' flexDirection='column' w='60px'>
      <Box>
        <Link href='/'>
          <Flex mt='5px' justifyContent='center' w='100%' cursor='pointer'>
            <IoGrid size='1.7em' />
          </Flex>
        </Link>
        <Link href='/settings'>
          <Flex mt='20px' justifyContent='center' w='100%' cursor='pointer'>
            <IoOptionsOutline size='1.7em' />
          </Flex>
        </Link>
      </Box>
      <Box>
        <Flex mb='20px' justifyContent='center' w='100%' cursor='pointer'>
          <IconButton
           variant="ghost"
           onClick={toggleColorMode}
           icon={colorMode === "light" ? <IoSunny size='1.7em'/> : <IoSunnyOutline size='1.7em'/>}
          />
        </Flex>
      </Box>
    </Flex>
  )
}