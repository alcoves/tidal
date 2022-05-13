import useSWR from 'swr'
import PresetRow from './Presets/PresetRow'
import CreatePreset from './Presets/CreatePreset'
import { fetcher } from '../utils/fetcher'
import { Box, Heading, HStack, Stack } from '@chakra-ui/react'

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
          {data?.presets.map(preset => {
            return <PresetRow key={preset.id} preset={preset} />
          })}
        </Stack>
      </Box>
    </Box>
  )
}
