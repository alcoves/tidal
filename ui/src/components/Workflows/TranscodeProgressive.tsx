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
        dispatchWebhook: event.target.dispatchWebhook.checked,
        input: {
          bucket: event.target.inputBucket.value,
          key: event.target.inputKey.value,
        },
        output: {
          bucket: event.target.outputBucket.value,
          path: event.target.outputPath.value,
        },
        entityId: event.target.entityId.value,
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
                <FormLabel>Input Bucket</FormLabel>
                <Input id='inputBucket' size='sm' variant='filled' placeholder='input-bucket' />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Input Key</FormLabel>
                <Input id='inputKey' size='sm' variant='filled' placeholder='input-key' />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Output Bucket</FormLabel>
                <Input id='outputBucket' size='sm' variant='filled' placeholder='output-bucket' />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Output Path</FormLabel>
                <Input id='outputPath' size='sm' variant='filled' placeholder='output-path' />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Entity Id</FormLabel>
                <Input id='entityId' size='sm' variant='filled' placeholder='entityId' />
              </FormControl>
              <FormControl>
                <FormLabel>Dispatch Webhooks</FormLabel>
                <Switch id='dispatchWebhook' />
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
