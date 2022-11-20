import {
  Text,
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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IoTrashBinSharp } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { deleteVideo } from '../../services/api'

export default function DeleteVideoAsset({ videoId }: { videoId: string }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation(deleteVideo, {
    onSuccess: () => {
      queryClient.invalidateQueries(['videos'])
      onClose()
      navigate(-1)
    },
  })

  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Button
        leftIcon={<IoTrashBinSharp />}
        size='sm'
        variant='outline'
        colorScheme='red'
        onClick={onOpen}
      >
        Delete Video
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Video</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you absolutely sure you want to delete this video?</Text>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme='red'
              onClick={() => {
                mutation.mutate({ id: videoId })
              }}
            >
              Delete Video
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
