import { Box, Heading, HStack, Stack } from '@chakra-ui/react'
import useSWR from 'swr'
import { fetcher } from '../utils/fetcher'
import CreatePreset from './Presets/CreatePreset'
import PresetRow from './Presets/PresetRow'

export default function Presets() {
  const { data } = useSWR('/presets', fetcher)

  return (
    <Box>
      <Box mb='2'>
        <Heading mb='2'>Presets</Heading>
        <Stack>
          <HStack justify='end'>
            <CreatePreset />
          </HStack>
          {data?.presets.map(p => {
            return <PresetRow key={p.id} preset={p} />
          })}
        </Stack>
      </Box>
    </Box>
  )
}
