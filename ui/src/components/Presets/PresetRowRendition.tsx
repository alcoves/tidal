import useSWR from 'swr'
import { fetcher } from '../../utils/fetcher'
import { Box, Flex, IconButton, Text } from '@chakra-ui/react'
import { IoRemoveOutline } from 'react-icons/io5'

export default function PresetRowRendition({ id }: { id: string }) {
  const { data } = useSWR(`/renditions/${id}`, fetcher)
  return (
    <Flex ml='2'>
      <IconButton mr='2' size='sm' icon={<IoRemoveOutline />} aria-label='remove-rendition' />
      <Box fontFamily='mono' w='100%'>
        <Text>name: {data.name}</Text>
        <Text>cmd: {data.cmd}</Text>
      </Box>
    </Flex>
  )
}
