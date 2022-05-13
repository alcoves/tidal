import { useEffect, useState } from 'react'
import { IoTrashBin } from 'react-icons/io5'
import { useLazyRequest } from '../../hooks/useRequest'
import { Button, HStack, IconButton, Input } from '@chakra-ui/react'

export default function PresetRow({ preset = {}, mutate }: { preset: any; mutate: any }) {
  const [updatePreset, { loading: updateLoading, error: updateError }] = useLazyRequest(
    `/presets/${preset?.id}`,
    {
      method: 'PATCH',
    }
  )
  const [deletePreset, { loading: deleteLoading, error: deleteError }] = useLazyRequest(
    `/presets/${preset?.id}`,
    {
      method: 'DELETE',
    }
  )

  const [presetState, setPresetState] = useState({
    id: preset?.id || '',
    cmd: preset?.cmd || '',
    name: preset?.name || '',
  })

  useEffect(() => {
    if (updateLoading && !updateError) mutate()
    if (deleteLoading && !deleteError) mutate()
  }, [updateLoading, updateError, deleteLoading, deleteError])

  function handleInputChange(e) {
    setPresetState({ ...presetState, [e.target.name]: e.target.value })
  }

  return (
    <HStack>
      <Input
        w='auto'
        size='sm'
        name='name'
        variant='filled'
        value={presetState.name}
        onChange={handleInputChange}
        placeholder='Preset Name'
      />
      <Input
        w='100%'
        size='sm'
        name='cmd'
        variant='filled'
        value={presetState.cmd}
        onChange={handleInputChange}
        placeholder='FFmpeg Command'
      />
      <IconButton
        size='sm'
        icon={<IoTrashBin />}
        aria-label='delete-preset'
        onClick={() => {
          deletePreset({
            data: {
              id: presetState.id,
            },
          })
        }}
      />
      <Button
        size='sm'
        onClick={() => {
          updatePreset({ data: presetState })
        }}
      >
        Save
      </Button>
    </HStack>
  )
}
