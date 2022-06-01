import hash from 'object-hash'
import { useEffect, useState } from 'react'
import { IoTrashBin } from 'react-icons/io5'
import { useSWRConfig } from 'swr'
import { useLazyRequest } from '../../hooks/useRequest'
import {
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  NumberInput,
  NumberInputField,
  Text,
  VStack,
} from '@chakra-ui/react'

export default function PresetRow(props: any = {}) {
  const { mutate } = useSWRConfig()
  const [preset, setPreset] = useState(props.preset)

  const [initialHash, setInitialHash] = useState(hash(props.preset))
  const [updatedHash, setUpdatedHash] = useState(hash(preset))

  useEffect(() => {
    setInitialHash(hash(props.preset))
    setUpdatedHash(hash(preset))
  }, [props.preset, preset])

  const [updatePreset, { loading: updatePresetLoading }] = useLazyRequest(
    `/presets/${props.preset?.id}`,
    {
      method: 'PATCH',
    }
  )
  const [deletePreset, { loading: deletePresetLoading }] = useLazyRequest(
    `/presets/${props.preset?.id}`,
    {
      method: 'DELETE',
    }
  )

  async function handleDelete() {
    await deletePreset({
      data: {
        id: preset.id,
      },
    })
    mutate('/presets')
  }

  function handleInputChange(e) {
    setPreset({ ...preset, [e.target.name]: e.target.value })
  }

  function handleSave() {
    updatePreset({ data: preset })
    setInitialHash(updatedHash) // reset hash
  }

  const isSaveDisabled = initialHash === updatedHash

  return (
    <Flex direction='column' p='2' borderColor='gray.700' borderWidth='1px' rounded='md'>
      <Flex justify='space-between'>
        <Editable defaultValue={preset.name} fontSize='1.4rem' fontWeight='600'>
          <EditablePreview />
          <EditableInput
            name='name'
            value={preset.name}
            onChange={handleInputChange}
            placeholder='Preset Name'
          />
        </Editable>
        <HStack align='center'>
          <IconButton
            size='sm'
            icon={<IoTrashBin />}
            onClick={handleDelete}
            aria-label='delete-preset'
          />
          <Button
            size='sm'
            onClick={handleSave}
            isDisabled={isSaveDisabled}
            colorScheme={!isSaveDisabled ? 'yellow' : null}
            isLoading={updatePresetLoading || deletePresetLoading}
          >
            Save
          </Button>
        </HStack>
      </Flex>
      <Text fontFamily='mono' fontSize='.9rem' opacity='.6'>
        ID: {preset.id}
      </Text>
      <VStack align='start' mt='2'>
        <Heading size='xs'>FFmpeg Command</Heading>
        <Input
          w='100%'
          size='sm'
          name='cmd'
          variant='filled'
          value={preset.cmd}
          onChange={handleInputChange}
          placeholder='FFmpeg Command'
        />
        <Heading size='xs'>Package Command</Heading>
        <Input
          w='100%'
          size='sm'
          name='package_cmd'
          variant='filled'
          value={preset.package_cmd}
          onChange={handleInputChange}
          placeholder='Package Command'
        />
        <Heading size='xs'>Constraints</Heading>
        <HStack>
          <NumberInput
            size='xs'
            maxW='75px'
            max={10000}
            variant='filled'
            name='constraints.width'
            value={preset?.constraints?.width}
            onChange={v =>
              setPreset({ ...preset, constraints: { ...preset.constraints, width: parseInt(v) } })
            }
          >
            <NumberInputField />
          </NumberInput>
          <Text>x</Text>
          <NumberInput
            size='xs'
            maxW='75px'
            max={10000}
            variant='filled'
            name='constraints.height'
            value={preset?.constraints?.height}
            onChange={v =>
              setPreset({ ...preset, constraints: { ...preset.constraints, height: parseInt(v) } })
            }
          >
            <NumberInputField />
          </NumberInput>
        </HStack>
      </VStack>
    </Flex>
  )
}
