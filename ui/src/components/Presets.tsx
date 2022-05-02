import { Box, Heading, HStack } from '@chakra-ui/react'
import CreatePreset from './Presets/CreatePreset'

export default function Presets() {
  return (
    <Box>
      <Box mb='2'>
        <Heading mb='2'>Presets</Heading>
        <HStack justify='end'>
          <CreatePreset />
        </HStack>
      </Box>
    </Box>
  )
}
