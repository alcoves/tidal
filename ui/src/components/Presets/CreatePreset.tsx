import { useSWRConfig } from 'swr'
import { useEffect, useState } from 'react'
import { Button, Flex, Input } from '@chakra-ui/react'
import { useLazyRequest } from '../../hooks/useRequest'

export default function CreatePreset() {
  const { mutate } = useSWRConfig()
  const [name, setName] = useState('')
  const [createWorkflow, { data, loading }] = useLazyRequest('/presets', { method: 'POST' })

  useEffect(() => {
    if (!loading && data) {
      mutate(`/presets`)
    }
  }, [loading, data])

  function handleSubmit() {
    createWorkflow({ data: { name } })
    setName('')
  }

  return (
    <Flex>
      <Input onChange={e => setName(e.target.value)} placeholder='New Preset' />
      <Button isLoading={loading} ml='2' onClick={handleSubmit}>
        Create
      </Button>
    </Flex>
  )
}
