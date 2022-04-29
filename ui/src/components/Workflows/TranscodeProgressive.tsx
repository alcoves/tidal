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
  Text,
  Input,
  FormControl,
  FormLabel,
  Switch,
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { useLazyRequest } from '../../hooks/useRequest'

export default function TranscodeProgressive() {
  const [transcodeProgressive, { data, loading }] = useLazyRequest('/jobs/transcode/progressive', {
    method: 'POST',
  })
  const { isOpen, onOpen, onClose } = useDisclosure()

  function handleSubmit(event: any) {
    event.preventDefault()
    transcodeProgressive({
      data: {
        cmd: event.target.cmd.value,
        input: event.target.input.value,
        output: event.target.output.value,
        entityId: event.target.entityId.value,
        webhooks: event.target.webhooks.checked,
      },
    })
  }

  useEffect(() => {
    if (data) {
      onClose()
    }
  }, [data])

  return (
    <>
      <Button onClick={onOpen}>Transcode Progressive</Button>

      <Modal size='xl' isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transcode Progressive</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <Text mb='2'>Given an input file, Tidal will transcode the file.</Text>
              <FormControl isRequired>
                <FormLabel>Input</FormLabel>
                <Input id='input' size='sm' variant='filled' placeholder='input' />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Command</FormLabel>
                <Input
                  id='cmd'
                  size='sm'
                  variant='filled'
                  placeholder='-c:v libx265 -crf 23 -preset fast'
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Output</FormLabel>
                <Input id='output' size='sm' variant='filled' placeholder='output' />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Entity Id</FormLabel>
                <Input id='entityId' size='sm' variant='filled' placeholder='entityId' />
              </FormControl>
              <FormControl>
                <FormLabel>Dispatch Webhooks</FormLabel>
                <Switch id='webhooks' />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onClose}>
                Close
              </Button>
              <Button isLoading={loading} type='submit' colorScheme='yellow'>
                Enqueue
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  )
}
