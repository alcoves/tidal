import { useState } from 'react'
import { Alert, AlertIcon, Button, Heading, Textarea, VStack } from '@chakra-ui/react'
import { Box } from '@chakra-ui/react'

const defaultValue = `{
  "input": "https://cdn.bken.io/samples/small.mp4"
}`

export default function AddJob() {
  const [value, setValue] = useState(defaultValue)

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value)
  }

  function validateJson() {
    try {
      JSON.parse(value)
      return true
    } catch (error) {
      return false
    }
  }

  const jsonIsValid = validateJson()

  return (
    <Box maxW='700px'>
      <VStack>
        <Heading alignSelf='start' size='md'>
          Create a video asset given an input URL
        </Heading>
        <Textarea fontFamily='mono' value={value} onChange={handleChange} />
        <Alert status={jsonIsValid ? 'success' : 'error'}>
          <AlertIcon />
          Json is {jsonIsValid ? 'valid' : 'invalid'}
        </Alert>
        <Button w='100%' isDisabled={!jsonIsValid} colorScheme='teal'>
          Submit
        </Button>
      </VStack>
    </Box>
  )
}
