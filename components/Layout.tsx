import Link from 'next/link'
import { Flex } from '@chakra-ui/react'

export default function Layout({ children }: any) {
  return (
    <Flex h='100vh' w='100vw'>
      <Flex direction='column' w='200px' color='white'>
        <Flex justify='center' align='center' p='4' border='solid grey 1px'>
          <Link href='/'> Dashboard </Link>
        </Flex>
      </Flex>
      <Flex w='100%'>{children}</Flex>
    </Flex>
  )
}
