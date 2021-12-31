import axios from 'axios'
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
} from '@chakra-ui/react'
import { useState } from 'react'

export default function IngestVideo() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [input, setInput] = useState(`s3://cdn.bken.io/samples/1m.mp4`)
  const [output, setOutput] = useState(`s3://cdn.bken.io/samples/1m-optimized.mp4`)

  async function handleIngest() {
    try {
      const res = await axios.post('/api/jobs', {
        input,
        output,
      })
      console.log(res)
      onClose()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <Button variant='solid' onClick={onOpen}>
        Add Job
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Job</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input value={input} placeholder='' onChange={e => setInput(e.target.value)} />
            <Input value={output} placeholder='' onChange={e => setOutput(e.target.value)} />
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme='blue' onClick={handleIngest}>
              Ingest
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
