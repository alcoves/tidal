import { useEffect, useState } from 'react'
import {
  Box,
  Flex,
  Stack,
  Input,
  Button,
  Heading,
  InputGroup,
  InputLeftAddon,
} from '@chakra-ui/react'

const settings = {
  api_key: 'secret',
  webhook_url: 'https://example.com/webhook',
  bunny_access_key: 'bunny-key',
  concurrent_transcode_jobs: 10,
  cdn_hostname: 'dev-cdn.bken.io',
  default_bucket: 'dev-cdn-bken-io',
  aws_access_key: 'test-key',
  aws_secret_access_key: 'test-key',
  aws_endpoint: 'https://test.aws.com',
  redis_port: '6379',
  redis_host: 'localhost',
  redis_password: 'test',
}

const props = {
  settings: settings,
  settings_b64: window.btoa(JSON.stringify(settings)),
}

export default function Settings() {
  const initialSettingsHash = props.settings_b64

  const [showSecrets, setShowSecrets] = useState(false)
  const [settings, setSetting] = useState(props.settings)
  const [settingsHash, setSettingHash] = useState(props.settings_b64)

  useEffect(() => {
    setSettingHash(window.btoa(JSON.stringify(settings)))
  }, [settings])

  function handleShowSecrets() {
    setShowSecrets(!showSecrets)
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
      <Box py='2'>
        <Button onClick={handleShowSecrets} size='xs' colorScheme='yellow'>
          {showSecrets ? 'Hide' : 'Show'} Secrets
        </Button>
      </Box>
      <Stack mt='3'>
        <Stack>
          <Heading size='sm'>CDN Hostname</Heading>
          <Input
            w='100%'
            name='cdn_hostname'
            variant='filled'
            placeholder='CDN Hostname'
            onChange={handleChange}
            defaultValue={settings.cdn_hostname}
          />
        </Stack>
        <Stack>
          <Heading size='sm'>Concurrent Transcode Jobs</Heading>
          <Input
            w='100%'
            name='concurrent_transcode_jobs'
            variant='filled'
            placeholder='Concurrent Transcode Jobs'
            onChange={handleChange}
            defaultValue={settings.concurrent_transcode_jobs}
          />
        </Stack>
        <Stack>
          <Heading size='sm'>Webhook URL</Heading>
          <Input
            w='100%'
            name='webhook_url'
            variant='filled'
            placeholder='Webhook URL'
            onChange={handleChange}
            defaultValue={settings.webhook_url}
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
            defaultValue={settings.api_key}
            type={showSecrets ? 'text' : 'password'}
          />
        </Stack>
        <Stack>
          <Heading size='sm'>Bunny CDN Access Key</Heading>
          <Input
            w='100%'
            name='bunny_access_key'
            variant='filled'
            placeholder='Bunny CDN Access Key'
            onChange={handleChange}
            defaultValue={settings.bunny_access_key}
          />
        </Stack>
        <Stack>
          <Heading size='sm'>S3 Object Storage</Heading>
          <InputGroup>
            <InputLeftAddon w='200px' children='Default Bucket' />
            <Input
              w='100%'
              variant='filled'
              name='default_bucket'
              placeholder='Default Bucket'
              onChange={handleChange}
              defaultValue={settings.default_bucket}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftAddon w='200px' children='Access Key' />
            <Input
              w='100%'
              variant='filled'
              name='aws_access_key'
              placeholder='Access Key'
              onChange={handleChange}
              defaultValue={settings.aws_access_key}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftAddon w='200px' children='Access Key Secret' />
            <Input
              w='100%'
              variant='filled'
              onChange={handleChange}
              name='aws_secret_access_key'
              placeholder='Access Secret Access Key'
              defaultValue={settings.aws_secret_access_key}
              type={showSecrets ? 'text' : 'password'}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftAddon w='200px' children='Endpoint' />
            <Input
              w='100%'
              variant='filled'
              name='aws_endpoint'
              placeholder='Endpoint'
              onChange={handleChange}
              defaultValue={settings.aws_endpoint}
            />
          </InputGroup>
        </Stack>
        <Stack>
          <Heading size='sm'>Redis</Heading>
          <InputGroup>
            <InputLeftAddon w='200px' children='Redis Port' />
            <Input
              w='100%'
              variant='filled'
              name='redis_port'
              placeholder='Redis Port'
              onChange={handleChange}
              defaultValue={settings.redis_port}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftAddon w='200px' children='Redis Host' />
            <Input
              w='100%'
              variant='filled'
              onChange={handleChange}
              name='redis_host'
              placeholder='Redis Host'
              defaultValue={settings.redis_host}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftAddon w='200px' children='Redis Password' />
            <Input
              w='100%'
              variant='filled'
              name='redis_password'
              placeholder='Redis Password'
              onChange={handleChange}
              defaultValue={settings.redis_password}
              type={showSecrets ? 'text' : 'password'}
            />
          </InputGroup>
        </Stack>
      </Stack>
      <Flex mt='2' w='100%' justify='end'>
        <Button colorScheme='yellow' isDisabled={initialSettingsHash === settingsHash}>
          Save
        </Button>
      </Flex>
    </Flex>
  )
}
