import hash from 'object-hash'
import {
  Box,
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  Wrap,
} from '@chakra-ui/react'
import useSWR, { useSWRConfig } from 'swr'
import { useEffect, useState } from 'react'
import { fetcher } from '../../utils/fetcher'
import { useLazyRequest } from '../../hooks/useRequest'
import { IoAddSharp, IoCloseSharp, IoTrashBin } from 'react-icons/io5'

export default function WorkflowRow(props: any = {}) {
  const { mutate } = useSWRConfig()
  const [workflow, setWorkflow] = useState(props.workflow)
  const { data: renditionsData } = useSWR('/renditions', fetcher)

  const [updateWorkflow] = useLazyRequest(`/workflows/${workflow?.id}`, {
    method: 'PATCH',
  })
  const [deleteWorkflow] = useLazyRequest(`/workflows/${workflow?.id}`, {
    method: 'DELETE',
  })

  async function handleDelete() {
    await deleteWorkflow({
      data: {
        id: workflow.id,
      },
    })
    mutate('/workflows')
  }

  useEffect(() => {
    const initialHash = hash(props.workflow)
    const updatedHash = hash(workflow)

    if (initialHash !== updatedHash) {
      updateWorkflow({ data: workflow })
      mutate('/workflows')
    }
  }, [workflow])

  const filteredRenditions =
    renditionsData?.renditions.filter(r => !workflow?.renditions.includes(r.id)) || []

  function handleInputChange(e) {
    setWorkflow({ ...workflow, [e.target.name]: e.target.value })
  }

  return (
    <Flex direction='column' p='2' borderColor='gray.700' borderWidth='1px' rounded='md'>
      <Flex justify='space-between'>
        <Editable defaultValue={workflow.name} fontSize='1.4rem' fontWeight='600'>
          <EditablePreview />
          <EditableInput
            name='name'
            value={workflow.name}
            onChange={handleInputChange}
            placeholder='Workflow Name'
          />
        </Editable>
        <IconButton
          size='sm'
          icon={<IoTrashBin />}
          aria-label='delete-rendition'
          onClick={handleDelete}
        />
      </Flex>

      <Text fontFamily='mono' fontSize='.9rem' opacity='.6'>
        ID: {workflow.id}
      </Text>
      <Heading size='sm' my='2'>
        Renditions
      </Heading>

      <Box mb='2'>
        <Menu>
          <MenuButton
            size='xs'
            as={Button}
            leftIcon={<IoAddSharp />}
            isDisabled={!filteredRenditions.length}
          >
            Rendition
          </MenuButton>
          <MenuList>
            {filteredRenditions.map(r => {
              return (
                <MenuItem
                  key={r.id}
                  name={r.id}
                  onClick={() => {
                    setWorkflow(prev => {
                      return { ...prev, renditions: [...prev.renditions, r.id] }
                    })
                  }}
                >
                  {r.name}
                </MenuItem>
              )
            })}
          </MenuList>
        </Menu>
      </Box>

      <Wrap>
        {workflow?.renditions.map(id => {
          const rendition = renditionsData?.renditions.find(r => r.id === id)
          if (!rendition) return null
          return (
            <Box key={id}>
              <Tag variant='subtle' colorScheme='yellow'>
                <TagLeftIcon
                  as={IoCloseSharp}
                  cursor='pointer'
                  onClick={() => {
                    setWorkflow(prev => {
                      return {
                        ...prev,
                        renditions: prev.renditions.filter(r => r !== id),
                      }
                    })
                  }}
                />
                <TagLabel>{rendition.name}</TagLabel>
              </Tag>
            </Box>
          )
        })}
      </Wrap>
    </Flex>
  )
}
