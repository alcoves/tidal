import { Flex } from '@chakra-ui/react'
import Link from 'next/link'

export default function Layout({ children }: any) {
  return (
    <Flex h='100vh' w='100vw'>
      <Flex direction='column' w='200px' color='white'>
        <Flex w='100%' justify='center' align='center' p='4' border='solid grey 1px'>
          <Link href='/'> Dashboard </Link>
        </Flex>
        {/* <Link href='/jobs'> Jobs </Link> */}
      </Flex>
      <Flex>{children}</Flex>
    </Flex>
  )
}
