import { Flex, VStack } from '@chakra-ui/react'
import CreateJob from './Jobs/CreateJob'

export default function Home() {
  return (
    <Flex>
      <CreateJob />
    </Flex>
  )
}
