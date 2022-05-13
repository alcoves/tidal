import { useSWRConfig } from 'swr'
import { useEffect, useState } from 'react'
import { Button, Flex, Input } from '@chakra-ui/react'
import { useLazyRequest } from '../../hooks/useRequest'

export default function CreateWorkflow() {
  const { mutate } = useSWRConfig()
  const [name, setName] = useState('')
  const [createWorkflow, { data, loading }] = useLazyRequest('/workflows', { method: 'POST' })

  useEffect(() => {
    if (!loading && data) {
      mutate(`/workflows`)
    }
  }, [loading, data])

  function handleSubmit() {
    createWorkflow({ data: { name } })
    setName('')
  }

  return (
    <Flex>
      <Input onChange={e => setName(e.target.value)} placeholder='New Workflow' />
      <Button isLoading={loading} ml='2' onClick={handleSubmit}>
        Create
      </Button>
    </Flex>
  )
}
