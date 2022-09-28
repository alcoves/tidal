import {
  Button,
  Input,
  Heading,
  Box,
  Text,
  VStack,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react'

import { useState } from 'react'
import { tidalTokenKey } from '../../config/global'

export default function TokenSettings() {
  const [inputToken, setInputToken] = useState('')

  return (
    <Box maxW='500px'>
      <Heading size='lg' mb='4'>
        API Token
      </Heading>
      <VStack spacing='4'>
        <Box>
          <Text>
            {`The Tidal UI must use a valid API token to perform requests
        against the Tidal API. The token set here will be used on every
        API request.
        `}
          </Text>
        </Box>

        <Alert status='info'>
          <AlertIcon />
          <AlertDescription>
            {`Tokens are stored client-side in local storage. This will persist
        your token across sessions. You can manually clear your token here.
        `}
          </AlertDescription>
          <AlertDescription>
            <Button
              mt='2'
              size='sm'
              colorScheme='blue'
              onClick={() => {
                localStorage.removeItem(tidalTokenKey)
              }}
            >
              Clear Token
            </Button>
          </AlertDescription>
        </Alert>

        <Box w='100%'>
          <VStack align='start'>
            <Heading mb='2' size='sm'>
              Token
            </Heading>
            <Input
              value={inputToken}
              onChange={e => setInputToken(e.target.value)}
              placeholder='Tidal API Key'
            />
            <Button
              size='sm'
              colorScheme='blue'
              onClick={() => {
                localStorage.setItem(tidalTokenKey, inputToken)
                setInputToken('')
              }}
            >
              Set Token
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
}
