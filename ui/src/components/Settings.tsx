import useSWR from 'swr'
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
import { useLazyRequest } from '../hooks/useRequest'
import { TidalSettings } from '../../../api/src/types'
import { fetcher } from '../utils/fetcher'

function Settings(props: SettingsProps) {
  const initialSettingsHash = props.settings_b64

  const [saveSettings] = useLazyRequest('/settings', { method: 'PUT' })

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
      <Heading mb='2'>Settings</Heading>
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
          <Heading size='sm'>Bunny CDN</Heading>
          <Input
            w='100%'
            name='cdnHostname'
            variant='filled'
            placeholder='CDN Hostname (optional)'
            onChange={handleChange}
            defaultValue={settings.cdnHostname}
          />
          <Input
            w='100%'
            name='bunnyAccessKey'
            variant='filled'
            placeholder='Bunny CDN Access Key (optional)'
            onChange={handleChange}
            defaultValue={settings.bunnyAccessKey}
            type={showSecrets ? 'text' : 'password'}
          />
        </Stack>
        <Stack>
          <Heading size='sm'>NFS Mount Path</Heading>
          <Input
            w='100%'
            name='nfsMountPath'
            variant='filled'
            placeholder='NFS Mount Path'
            onChange={handleChange}
            defaultValue={settings.nfsMountPath}
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
  const { data, error } = useSWR(`/settings`, fetcher)
  if (!data && !error) return <Spinner />
  return <Settings settings={data} settings_b64={window.btoa(JSON.stringify(data))} />
}
