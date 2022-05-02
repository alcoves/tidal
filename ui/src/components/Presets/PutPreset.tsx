import { Box, Checkbox, Flex, Heading, HStack, IconButton, Input, Stack } from '@chakra-ui/react'
import { useState } from 'react'
import { IoAdd, IoRemove } from 'react-icons/io5'

export default function PutPreset() {
  const [state, setState] = useState({
    id: '',
    name: '',
    renditions: [],
    hls: false,
    chunked: false,
  })

  function handleAddRendition() {
    setState(prev => {
      const newRen = prev.renditions
      newRen.push({ id: prev.renditions.length + 1, name: 'New Preset', cmd: '' })
      return {
        ...prev,
        renditions: newRen,
      }
    })
  }

  function handleRemoveRendition(index: number) {
    console.log('Remove item at index: ', index)

    setState(prev => {
      const filtered = prev.renditions.filter((_, i) => i !== index)
      console.log('Filtered: ', filtered)

      return {
        ...prev,
        renditions: filtered,
      }
    })
  }

  function handleChangeRendition(e, i) {
    setState(prev => {
      return {
        ...prev,
        renditions: prev.renditions.map((ren, index) => {
          if (index === i) {
            return {
              ...ren,
              [e.target.name]: e.target.value,
            }
          }

          return ren
        }),
      }
    })
  }

  return (
    <Box>
      <Stack my='2'>
        <Input defaultValue={state.id} variant='filled' placeholder='ID' />
        <Input defaultValue={state.name} variant='filled' placeholder='Name' />

        <Flex justify='space-between'>
          <Heading size='sm'> Renditions </Heading>
          <HStack spacing='1'>
            <IconButton
              onClick={handleAddRendition}
              size='xs'
              icon={<IoAdd />}
              aria-label='add-rendition'
            />
          </HStack>
        </Flex>
        {state.renditions.map((r, i) => {
          return (
            <Stack key={i}>
              <Flex>
                <IconButton
                  mr='2'
                  size='sm'
                  onClick={() => handleRemoveRendition(i)}
                  icon={<IoRemove />}
                  aria-label='remove-rendition'
                />
                <Input
                  name='id'
                  size='sm'
                  value={r.id}
                  placeholder='ID'
                  variant='filled'
                  onChange={e => handleChangeRendition(e, i)}
                />
              </Flex>
              <Input
                size='sm'
                name='name'
                value={r.name}
                variant='filled'
                placeholder='Name'
                onChange={e => handleChangeRendition(e, i)}
              />
              <Input
                size='sm'
                name='cmd'
                value={r.cmd}
                variant='filled'
                placeholder='FFmpeg Command'
                onChange={e => handleChangeRendition(e, i)}
              />
            </Stack>
          )
        })}

        <Checkbox defaultChecked={state.hls} isDisabled>
          HLS
        </Checkbox>
        <Checkbox defaultChecked={state.chunked} isDisabled>
          Chunked Encoding
        </Checkbox>
      </Stack>
    </Box>
  )
}
