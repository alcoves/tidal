import hash from 'object-hash'
import { useEffect, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { fetcher } from '../../utils/fetcher'
import { useLazyRequest } from '../../hooks/useRequest'
import { IoAddSharp, IoCloseSharp, IoTrashBin } from 'react-icons/io5'
import {
  Box,
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  Heading,
  HStack,
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

export default function WorkflowRow(props: any = {}) {
  const { mutate } = useSWRConfig()
  const [workflow, setWorkflow] = useState(props.workflow)

  const [initialHash, setInitialHash] = useState(hash(props.workflow))
  const [updatedHash, setUpdatedHash] = useState(hash(workflow))

  useEffect(() => {
    setInitialHash(hash(props.workflow))
    setUpdatedHash(hash(workflow))
  }, [props.workflow, workflow])

  const { data: presetData } = useSWR('/presets', fetcher)
  const [updateWorkflow, { loading: updateWorkflowLoading }] = useLazyRequest(
    `/workflows/${workflow?.id}`,
    {
      method: 'PATCH',
    }
  )
  const [deleteWorkflow, { loading: deleteWorkflowLoading }] = useLazyRequest(
    `/workflows/${workflow?.id}`,
    {
      method: 'DELETE',
    }
  )

  async function handleDelete() {
    await deleteWorkflow({
      data: {
        id: workflow.id,
      },
    })
    mutate('/workflows')
  }

  function handleInputChange(e) {
    setWorkflow({ ...workflow, [e.target.name]: e.target.value })
  }

  function handleSave() {
    updateWorkflow({ data: workflow })
    setInitialHash(updatedHash) // reset hash
  }

  const isSaveDisabled = initialHash === updatedHash
  const filteredPresets = presetData?.presets?.filter(r => !workflow?.presets?.includes(r.id)) || []

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
        <HStack align='center'>
          <IconButton
            size='sm'
            icon={<IoTrashBin />}
            aria-label='delete-preset'
            onClick={handleDelete}
          />
          <Button
            size='sm'
            onClick={handleSave}
            isDisabled={isSaveDisabled}
            colorScheme={!isSaveDisabled ? 'yellow' : null}
            isLoading={updateWorkflowLoading || deleteWorkflowLoading}
          >
            Save
          </Button>
        </HStack>
      </Flex>
      <Text fontFamily='mono' fontSize='.9rem' opacity='.6'>
        ID: {workflow.id}
      </Text>
      <Heading size='sm' my='2'>
        Presets
      </Heading>
      <Box mb='2'>
        <Menu>
          <MenuButton
            size='xs'
            as={Button}
            leftIcon={<IoAddSharp />}
            isDisabled={!filteredPresets.length}
          >
            Preset
          </MenuButton>
          <MenuList>
            {filteredPresets?.map(r => {
              return (
                <MenuItem
                  key={r.id}
                  name={r.id}
                  onClick={() => {
                    setWorkflow(prev => {
                      return { ...prev, presets: [...prev.presets, r.id] }
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
        {workflow?.presets.map(id => {
          const preset = presetData?.presets.find(r => r.id === id)
          if (!preset) return null
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
                        presets: prev.presets.filter(r => r !== id),
                      }
                    })
                  }}
                />
                <TagLabel>{preset.name}</TagLabel>
              </Tag>
            </Box>
          )
        })}
      </Wrap>
    </Flex>
  )
}
