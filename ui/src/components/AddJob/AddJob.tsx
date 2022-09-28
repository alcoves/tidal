import { Box, Input } from '@chakra-ui/react'

export default function AddJob() {
  return (
    <Box>
      <Input placeholder='input path or url' />
      <Input placeholder='ffmpeg command' />
      <Input placeholder='output path or url' />
    </Box>
  )
}
