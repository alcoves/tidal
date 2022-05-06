import {
  Button,
  Code,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  Heading,
  HStack,
  IconButton,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { IoTrashBin } from 'react-icons/io5'
import { useLazyRequest } from '../../hooks/useRequest'
import PresetRowRendition from './PresetRowRendition'

export default function PresetRow({ preset }: { preset: any }) {
  const [updateRendition, { loading: updateLoading, error: updateError }] = useLazyRequest(
    `/presets/${preset?.id}`,
    {
      method: 'PATCH',
    }
  )
  const [deleteRendition, { loading: deleteLoading, error: deleteError }] = useLazyRequest(
    `/presets/${preset?.id}`,
    {
      method: 'DELETE',
    }
  )

  const [presetState, setPresetState] = useState({
    id: preset?.id || '',
    cmd: preset?.cmd || '',
    name: preset?.name || '',
    renditions: preset?.renditions || [],
  })

  useEffect(() => {
    // if (updateLoading && !updateError) mutate()
    // if (deleteLoading && !deleteError) mutate()
  }, [updateLoading, updateError, deleteLoading, deleteError])

  function handleInputChange(e) {
    setPresetState({ ...presetState, [e.target.name]: e.target.value })
  }

  return (
    <Flex direction='column' bg='gray.700' p='2' rounded='md'>
      <Editable defaultValue={presetState.name} fontSize='1.4rem' fontWeight='600'>
        <EditablePreview />
        <EditableInput
          name='cmd'
          value={presetState.name}
          onChange={handleInputChange}
          placeholder='Preset Name'
        />
      </Editable>
      <Code>ID: {presetState.id}</Code>
      <Heading size='sm' my='2'>
        Renditions
      </Heading>
      {presetState?.renditions.map(id => {
        return <PresetRowRendition key={id} id={id} />
      })}

      <HStack alignSelf='end'>
        <IconButton
          size='sm'
          colorScheme='red'
          icon={<IoTrashBin />}
          aria-label='delete-rendition'
          onClick={() => {
            deleteRendition({
              data: {
                id: presetState.id,
              },
            })
          }}
        />
        <Button
          colorScheme='yellow'
          size='sm'
          onClick={() => {
            updateRendition({ data: presetState })
          }}
        >
          Save
        </Button>
      </HStack>
    </Flex>
  )
}
