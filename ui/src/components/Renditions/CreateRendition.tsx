import { useState, useEffect } from 'react'
import { useLazyRequest } from '../../hooks/useRequest'
import { Button, HStack, Input } from '@chakra-ui/react'

export default function CreateRendition({ mutate }: { mutate: any }) {
  const [createRendition, { loading, error }] = useLazyRequest('/renditions', { method: 'POST' })
  const [rendition, setRendition] = useState({
    name: '',
    cmd: '',
  })

  async function handleCreate() {
    await createRendition({ data: rendition })
  }

  useEffect(() => {
    if (!loading && !error) {
      setRendition({ name: '', cmd: '' })
      mutate()
    }
  }, [loading, error])

  function handleInputChange(e) {
    setRendition({ ...rendition, [e.target.name]: e.target.value })
  }

  return (
    <HStack>
      <Input
        w='auto'
        size='sm'
        name='name'
        variant='filled'
        isDisabled={loading}
        value={rendition.name}
        onChange={handleInputChange}
        placeholder='Rendition Name'
      />
      <Input
        w='100%'
        size='sm'
        name='cmd'
        variant='filled'
        isDisabled={loading}
        value={rendition.cmd}
        onChange={handleInputChange}
        placeholder='FFmpeg Command'
      />
      <Button isLoading={loading} size='sm' onClick={handleCreate}>
        Create
      </Button>
    </HStack>
  )
}
