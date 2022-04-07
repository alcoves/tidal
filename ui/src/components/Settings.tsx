import { useEffect, useState } from 'react'
import {
  Flex,
  Stack,
  Input,
  Button,
  Heading,
  InputGroup,
  InputLeftAddon,
  HStack,
  Spinner,
} from '@chakra-ui/react'
import { SettingsProps } from '../types'
import { useLazyRequest, useRequest } from '../hooks/useRequest'
import { TidalSettings } from '../../../src/types'

function Settings(props: SettingsProps) {
  const initialSettingsHash = props.settings_b64

  const [saveSettings, { data, loading, error }] = useLazyRequest('/settings', { method: 'PUT' })

  const [showSecrets, setShowSecrets] = useState(false)
  const [settings, setSetting] = useState<TidalSettings>(props.settings)
  const [settingsHash, setSettingHash] = useState(props.settings_b64)

  useEffect(() => {
    setSettingHash(window.btoa(JSON.stringify(settings)))
  }, [settings])

  function handleShowSecrets() {
    setShowSecrets(!showSecrets)
  }

  function logOut() {
    localStorage.removeItem('apiKey')
    window.location.reload()
  }

  function handleSave() {
    saveSettings({
      data: settings,
    })
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSetting(prev => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      }
    })
  }

  return (
    <Flex direction='column'>
      <Heading size='lg'>Settings</Heading>
      <HStack py='2'>
        <Button onClick={handleShowSecrets} size='xs' colorScheme='yellow'>
          {showSecrets ? 'Hide' : 'Show'} Secrets
        </Button>
        <Button onClick={logOut} size='xs' colorScheme='yellow'>
          Log Out
        </Button>
      </HStack>
      <Stack mt='3'>
        <Stack>
          <Heading size='sm'>CDN Hostname</Heading>
          <Input
            w='100%'
            name='cdnHostname'
            variant='filled'
            placeholder='CDN Hostname'
            onChange={handleChange}
            defaultValue={settings.cdnHostname}
          />
        </Stack>
        <Stack>
          <Heading size='sm'>Webhook URL</Heading>
          <Input
            w='100%'
            name='webhookUrl'
            variant='filled'
            placeholder='Webhook URL'
            onChange={handleChange}
            defaultValue={settings.webhookUrl}
          />
        </Stack>
        <Stack>
          <Heading size='sm'>API Key</Heading>
          <Input
            w='100%'
            name='api_key'
            variant='filled'
            placeholder='API Key'
            onChange={handleChange}
            defaultValue={settings.apiKey}
            type={showSecrets ? 'text' : 'password'}
          />
        </Stack>
        <Stack>
          <Heading size='sm'>Bunny CDN Access Key</Heading>
          <Input
            w='100%'
            name='bunnyAccessKey'
            variant='filled'
            placeholder='Bunny CDN Access Key'
            onChange={handleChange}
            defaultValue={settings.bunnyAccessKey}
            type={showSecrets ? 'text' : 'password'}
          />
        </Stack>
        <Stack>
          <Heading size='sm'>S3 Object Storage</Heading>
          <InputGroup>
            <InputLeftAddon w='200px' children='Access Key' />
            <Input
              w='100%'
              variant='filled'
              name='s3AccessKeyId'
              placeholder='Access Key ID'
              onChange={handleChange}
              defaultValue={settings.s3AccessKeyId}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftAddon w='200px' children='Access Key Secret' />
            <Input
              w='100%'
              variant='filled'
              onChange={handleChange}
              name='s3SecretAccessKey'
              placeholder='Secret Access Key'
              defaultValue={settings.s3SecretAccessKey}
              type={showSecrets ? 'text' : 'password'}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftAddon w='200px' children='Endpoint' />
            <Input
              w='100%'
              variant='filled'
              name='s3Endpoint'
              placeholder='Endpoint'
              onChange={handleChange}
              defaultValue={settings.s3Endpoint}
            />
          </InputGroup>
        </Stack>
      </Stack>
      <Flex mt='2' w='100%' justify='end'>
        <Button
          onClick={handleSave}
          colorScheme='yellow'
          isDisabled={initialSettingsHash === settingsHash}
        >
          Save
        </Button>
      </Flex>
    </Flex>
  )
}

export default function SettingsWrapper() {
  const { loading, data } = useRequest('/settings')
  if (loading) return <Spinner />
  return <Settings settings={data} settings_b64={window.btoa(JSON.stringify(data))} />
}
