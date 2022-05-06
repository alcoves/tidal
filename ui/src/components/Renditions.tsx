import useSWR from 'swr'
import RenditionRow from './Renditions/RenditionRow'
import CreateRendition from './Renditions/CreateRendition'
import { fetcher } from '../utils/fetcher'
import { Box, Heading, Stack } from '@chakra-ui/react'

export default function Renditions() {
  const { data, mutate } = useSWR('/renditions', fetcher)

  return (
    <Box>
      <Box mb='2'>
        <Heading mb='2'>Renditions</Heading>
        <Stack>
          <CreateRendition mutate={mutate} />
          {data?.renditions.map(rendition => {
            return <RenditionRow key={rendition.id} rendition={rendition} mutate={mutate} />
          })}
        </Stack>
      </Box>
    </Box>
  )
}
