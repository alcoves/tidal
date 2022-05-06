import { useEffect, useState } from 'react'
import { IoTrashBin } from 'react-icons/io5'
import { useLazyRequest } from '../../hooks/useRequest'
import { Button, HStack, IconButton, Input } from '@chakra-ui/react'

export default function RenditionRow({ rendition = {}, mutate }: { rendition: any; mutate: any }) {
  const [updateRendition, { loading: updateLoading }] = useLazyRequest(
    `/renditions/${rendition?.id}`,
    {
      method: 'PATCH',
    }
  )
  const [deleteRendition, { loading: deleteLoading }] = useLazyRequest(
    `/renditions/${rendition?.id}`,
    {
      method: 'DELETE',
    }
  )

  const [renditionState, setRenditionState] = useState({
    id: rendition?.id || '',
    cmd: rendition?.cmd || '',
    name: rendition?.name || '',
  })

  useEffect(() => {
    mutate()
  }, [updateLoading, deleteLoading])

  function handleInputChange(e) {
    setRenditionState({ ...renditionState, [e.target.name]: e.target.value })
  }

  return (
    <HStack>
      <Input
        w='auto'
        size='sm'
        name='name'
        variant='filled'
        value={renditionState.name}
        onChange={handleInputChange}
        placeholder='Rendition Name'
      />
      <Input
        w='100%'
        size='sm'
        name='cmd'
        variant='filled'
        value={renditionState.cmd}
        onChange={handleInputChange}
        placeholder='FFmpeg Command'
      />
      <IconButton
        size='sm'
        colorScheme='red'
        icon={<IoTrashBin />}
        aria-label='delete-rendition'
        onClick={() => {
          deleteRendition({
            data: {
              id: renditionState.id,
            },
          })
        }}
      />
      <Button
        colorScheme='yellow'
        size='sm'
        onClick={() => {
          updateRendition({ data: renditionState })
        }}
      >
        Save
      </Button>
    </HStack>
  )
}
