import { Box, Button, Heading, HStack, Input, Stack } from '@chakra-ui/react'

export default function Renditions() {
  return (
    <Box>
      <Box mb='2'>
        <Heading mb='2'>Renditions</Heading>
        <Stack>
          <HStack>
            <Input variant='filled' size='sm' name='id' placeholder='Rendition Name' w='auto' />
            <Input variant='filled' size='sm' name='cmd' placeholder='FFmpeg Command' w='100%' />
            <Button colorScheme='yellow' size='sm'>
              Create
            </Button>
          </HStack>

          <HStack>
            <Input variant='filled' size='sm' name='id' placeholder='Rendition Name' w='auto' />
            <Input variant='filled' size='sm' name='cmd' placeholder='FFmpeg Command' w='100%' />
            <Button colorScheme='yellow' size='sm'>
              Save
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Box>
  )
}
