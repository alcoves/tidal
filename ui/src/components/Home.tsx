import { Flex, VStack } from '@chakra-ui/react'
import TranscodeHLS from './Workflows/TranscodeHLS'
import TranscodeProgressive from './Workflows/TranscodeProgressive'

export default function Home() {
  return (
    <Flex>
      <VStack>
        <TranscodeHLS />
        <TranscodeProgressive />
      </VStack>
    </Flex>
  )
}
