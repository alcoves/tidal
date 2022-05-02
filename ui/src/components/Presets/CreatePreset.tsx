import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
} from '@chakra-ui/react'

export default function CreatePreset() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Button onClick={onOpen}>Create</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Preset</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Create the preset</ModalBody>
          <ModalFooter>
            <Button colorScheme='yellow'>Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
