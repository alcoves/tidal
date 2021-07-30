import { Flex } from '@chakra-ui/react'
import Sidebar from './Sidebar'

export default function Layout ({ children = {} }) {
  return (
    <Flex>
      <Sidebar/>
      <Flex w='100%' h='100%' p='4'>
        {children}
      </Flex>
    </Flex>
  )
}
