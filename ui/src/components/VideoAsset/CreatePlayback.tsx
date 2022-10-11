import {
  Modal,
  Button,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalOverlay,
  ModalContent,
  useDisclosure,
  ModalCloseButton,
} from '@chakra-ui/react'
import { createPlayback } from '../../services/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function CreatePlayback({ videoId }: { videoId: string }) {
  const queryClient = useQueryClient()

  const mutation = useMutation(createPlayback, {
    onSuccess: () => {
      queryClient.invalidateQueries(['videos', videoId])
      onClose()
    },
  })

  function handleCreate() {
    mutation.mutate({ id: videoId })
  }

  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Button size='xs' colorScheme='blue' onClick={onOpen}>
        Create
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Playback</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Creates a playback</ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onClose}>
              Close
            </Button>
            <Button colorScheme='blue' onClick={handleCreate}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
