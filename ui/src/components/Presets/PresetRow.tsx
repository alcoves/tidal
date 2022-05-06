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
import { fetcher, getApiUrl } from '../../utils/fetcher'
import { useLazyRequest } from '../../hooks/useRequest'
import { IoAddSharp, IoCloseSharp, IoTrashBin } from 'react-icons/io5'

export default function PresetRow(props: any) {
  const initialHash = Buffer.from(JSON.stringify(props.preset)).toString('base64')
  const [preset, setPreset] = useState({
    id: props?.preset?.id || '',
    cmd: props?.preset?.cmd || '',
    name: props?.preset?.name || '',
    renditions: props?.preset?.renditions || [],
  })

  const { mutate } = useSWRConfig()
  const { data: renditionsData } = useSWR('/renditions', fetcher)

  const [updatePreset] = useLazyRequest(`/presets/${preset?.id}`, {
    method: 'PATCH',
  })
  const [deletePreset] = useLazyRequest(`/presets/${preset?.id}`, {
    method: 'DELETE',
  })

  async function handleDelete() {
    await deletePreset({
      data: {
        id: preset.id,
      },
    })
    mutate('/presets')
  }

  useEffect(() => {
    if (initialHash !== Buffer.from(JSON.stringify(props.preset)).toString('base64')) {
      console.log('Preset has changed, updating...')
      updatePreset({ data: preset })
      mutate('/presets')
    }
  }, [preset])

  const filteredRenditions =
    renditionsData?.renditions.filter(r => !preset?.renditions.includes(r.id)) || []

  function handleInputChange(e) {
    setPreset({ ...preset, [e.target.name]: e.target.value })
  }

  return (
    <Flex direction='column' p='2' borderColor='gray.700' borderWidth='1px' rounded='md'>
      <Flex justify='space-between'>
        <Editable defaultValue={preset.name} fontSize='1.4rem' fontWeight='600'>
          <EditablePreview />
          <EditableInput
            name='cmd'
            value={preset.name}
            onChange={handleInputChange}
            placeholder='Preset Name'
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
        ID: {preset.id}
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
                    setPreset(prev => {
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
        {preset?.renditions.map(id => {
          const rendition = renditionsData?.renditions.find(r => r.id === id)
          if (!rendition) return null
          return (
            <Box key={id}>
              <Tag variant='subtle' colorScheme='yellow'>
                <TagLeftIcon
                  as={IoCloseSharp}
                  cursor='pointer'
                  onClick={() => {
                    setPreset(prev => {
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
