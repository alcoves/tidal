import { useState, useEffect } from 'react'
import { useLazyRequest } from '../../hooks/useRequest'
import { Button, HStack, Input } from '@chakra-ui/react'

export default function CreatePreset({ mutate }: { mutate: any }) {
  const [createPreset, { loading, error }] = useLazyRequest('/presets', { method: 'POST' })
  const [preset, setPreset] = useState({
    name: '',
    cmd: '',
  })

  async function handleCreate() {
    await createPreset({ data: preset })
  }

  useEffect(() => {
    if (!loading && !error) {
      setPreset({ name: '', cmd: '' })
      mutate()
    }
  }, [loading, error])

  function handleInputChange(e) {
    setPreset({ ...preset, [e.target.name]: e.target.value })
  }

  return (
    <HStack>
      <Input
        w='auto'
        size='sm'
        name='name'
        variant='filled'
        isDisabled={loading}
        value={preset.name}
        onChange={handleInputChange}
        placeholder='Preset Name'
      />
      <Input
        w='100%'
        size='sm'
        name='cmd'
        variant='filled'
        isDisabled={loading}
        value={preset.cmd}
        onChange={handleInputChange}
        placeholder='FFmpeg Command'
      />
      <Button isLoading={loading} size='sm' onClick={handleCreate}>
        Create
      </Button>
    </HStack>
  )
}
