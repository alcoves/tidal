import { Flex } from '@chakra-ui/react';
import Link from 'next/link';
import { IoOptionsOutline, IoStatsChartOutline } from 'react-icons/io5';

export default function NavBar() {
  return (
    <Flex flexDirection='column' w='60px'>
      <Link href='/'>
        <Flex mt='5px' justifyContent='center' w='100%' cursor='pointer'>
          <IoStatsChartOutline size='1.7em' />
        </Flex>
      </Link>
      <Link href='/settings'>
        <Flex mt='20px' justifyContent='center' w='100%' cursor='pointer'>
          <IoOptionsOutline size='1.7em' />
        </Flex>
      </Link>
    </Flex>
  )
}