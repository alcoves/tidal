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
  Text,
  Input,
} from '@chakra-ui/react'
import { IoSettingsSharp } from 'react-icons/io5'
import { createVideoFile } from '../../services/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function CreateRendition({ videoId }: { videoId: string }) {
  const queryClient = useQueryClient()

  const mutation = useMutation(createVideoFile, {
    onSuccess: () => {
      queryClient.invalidateQueries(['videos', videoId])
      onClose()
    },
  })

  function handleCreate() {
    mutation.mutate({ id: videoId, cmd: '-c:v libx264 -crf 30 -preset ultrafast' })
  }

  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Button
        leftIcon={<IoSettingsSharp />}
        size='sm'
        variant='outline'
        onClick={onOpen}
        colorScheme='teal'
      >
        Create File
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create File</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Creates a new video file given an ffmpeg command</Text>
            <Input placeholder='-' />
          </ModalBody>
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