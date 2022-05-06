import { useSWRConfig } from 'swr'
import { useEffect, useState } from 'react'
import { Button, Flex, Input } from '@chakra-ui/react'
import { useLazyRequest } from '../../hooks/useRequest'

export default function CreatePreset() {
  const { mutate } = useSWRConfig()
  const [name, setName] = useState('')
  const [createPreset, { data, loading }] = useLazyRequest('/presets', { method: 'POST' })

  useEffect(() => {
    if (!loading && data) {
      mutate(`/presets`)
    }
  }, [loading, data])

  function handleSubmit() {
    createPreset({ data: { name } })
    setName('')
  }

  return (
    <Flex>
      <Input onChange={e => setName(e.target.value)} placeholder='New Preset' />
      <Button ml='2' onClick={handleSubmit}>
        Create
      </Button>
    </Flex>
  )
}
