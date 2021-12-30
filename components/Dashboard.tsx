import AddVideo from './AddVideo'
import { Flex } from '@chakra-ui/react'

export default function Dashboard() {
  return (
    <Flex direction='column' w='100%' p='4'>
      <Flex justify='end'>
        <AddVideo />
      </Flex>
      <Flex>Here are the videos</Flex>
    </Flex>
  )
}
