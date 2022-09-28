import {
  Button,
  Input,
  Heading,
  Box,
  Text,
  VStack,
} from '@chakra-ui/react'

import { useState } from 'react';

const localStorageKey = "tidal_api_token"

export default function TokenSettings() {
  const [inputToken, setInputToken] = useState('')

  return (
    <Box maxW='500px'>
      <Heading size='lg' mb='4'>API Token</Heading>
      <VStack spacing='4'>
      <Box>
      <Text>
        {`The Tidal UI must use a valid API token to perform requests
        against the Tidal API. The token set here will be used on every
        API request.
        `}
        </Text>
        </Box>

        <Box p='2' bg='blue.100' rounded='md'>
          <Heading size='sm'> Token Storage </Heading>
        <Text>
        {`Tokens are stored client-side in local storage. This will persist
        your token across sessions. You can manually clear your token here.
        `}
        </Text>
        <Button mt='2' size='sm' colorScheme='blue' onClick={() => {
              localStorage.removeItem(localStorageKey)
            }}>Clear Token</Button>
        </Box>
        <Box w='100%'>
          <VStack align='start'>
          <Heading mb='2' size='sm'> Token </Heading>
          <Input
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              placeholder='Tidal API Key'
            />
                        <Button size='sm' colorScheme='blue' onClick={() => {
              localStorage.setItem(localStorageKey, inputToken)
              setInputToken('')
            }}>Set Token</Button>
                 </VStack>
        </Box>
        </VStack>
    </Box>
  )
}