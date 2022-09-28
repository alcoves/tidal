import { useState } from 'react'
import {
  Box,
  Alert,
  AlertIcon,
  Button,
  Heading,
  Textarea,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react'

const defaultValue = `{
  "input": "https://cdn.bken.io/samples/small.mp4"
}`

export default function AddJob() {
  const [value, setValue] = useState(defaultValue)
  const { isOpen, onOpen, onClose } = useDisclosure()

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
    <>
      <Button onClick={onOpen}>Create New Asset</Button>
      <Modal size='2xl' isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a video asset given an input URL</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              <Textarea minH='100px' fontFamily='mono' value={value} onChange={handleChange} />
              <Alert rounded='md' status={jsonIsValid ? 'success' : 'error'}>
                <AlertIcon />
                Json is {jsonIsValid ? 'valid' : 'invalid'}
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button w='100%' isDisabled={!jsonIsValid} colorScheme='teal'>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
