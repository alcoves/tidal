import NextLink from 'next/link'
import { GoDashboard } from 'react-icons/go'
import { IoSettingsOutline } from 'react-icons/io5'
import { Button, Flex, VStack } from '@chakra-ui/react'

export default function Layout({ children }: any) {
  return (
    <Flex h='100vh' w='100%'>
      <Flex direction='column' w='200px' color='white' bg='gray.900'>
        <VStack spacing={2} p='4'>
          <NextLink href='/' passHref>
            <Button w='100%' justifyContent='start' leftIcon={<GoDashboard />}>
              Dashboard
            </Button>
          </NextLink>
          <NextLink href='/config' passHref>
            <Button w='100%' justifyContent='start' leftIcon={<IoSettingsOutline />}>
              Config
            </Button>
          </NextLink>
        </VStack>
      </Flex>
      <Flex w='100%' overflowY='auto'>
        {children}
      </Flex>
    </Flex>
  )
}
