import useSWR from 'swr'
import PresetRow from './Presets/PresetRow'
import CreatePreset from './Presets/CreatePreset'
import { fetcher } from '../utils/fetcher'
import { Box, Heading, Stack } from '@chakra-ui/react'

export default function Presets() {
  const { data, mutate } = useSWR('/presets', fetcher)

  return (
    <Box>
      <Box mb='2'>
        <Heading mb='2'>Presets</Heading>
        <Stack>
          <CreatePreset mutate={mutate} />
          {data?.presets.map(preset => {
            return <PresetRow key={preset.id} preset={preset} mutate={mutate} />
          })}
        </Stack>
      </Box>
    </Box>
  )
}
