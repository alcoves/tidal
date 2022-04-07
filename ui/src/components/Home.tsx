import { Flex, VStack } from '@chakra-ui/react'
import TranscodeHLS from './Workflows/TranscodeHLS'

export default function Home() {
  return (
    <Flex>
      <VStack>
        <TranscodeHLS />
      </VStack>
    </Flex>
  )
}
