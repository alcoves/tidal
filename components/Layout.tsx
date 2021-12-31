import NextLink from 'next/link'
import { GoDashboard } from 'react-icons/go'
import { Button, Flex } from '@chakra-ui/react'

export default function Layout({ children }: any) {
  return (
    <Flex h='100vh' w='100%'>
      <Flex direction='column' w='200px' color='white' bg='gray.900'>
        <Flex justify='center' align='center' p='4'>
          <NextLink href='/' passHref>
            <Button w='100%' leftIcon={<GoDashboard />}>
              Dashboard
            </Button>
          </NextLink>
        </Flex>
      </Flex>
      <Flex w='100%' overflowY='auto'>
        {children}
      </Flex>
    </Flex>
  )
}
