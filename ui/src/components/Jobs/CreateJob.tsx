import useSWR from 'swr'
import {
  Box,
  Input,
  Modal,
  Button,
  VStack,
  Select,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalOverlay,
  ModalContent,
  useDisclosure,
  ModalCloseButton,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { IoCaretDown } from 'react-icons/io5'
import { fetcher } from '../../utils/fetcher'
import { useLazyRequest } from '../../hooks/useRequest'

export default function CreateJob() {
  const { data } = useSWR('/workflows', fetcher)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [createJob, { loading, data: jobData, error }] = useLazyRequest('/jobs/transcode', {
    method: 'POST',
  })

  const [job, setJobs] = useState({
    input: '',
    output: '',
    workflow: '',
  })

  useEffect(() => {
    if (!loading && jobData && !error) {
      onClose()
    }
  }, [jobData])

  function submitJob() {
    createJob({ data: job })
  }

  function handleInput(e) {
    setJobs({ ...job, [e.target.name]: e.target.value })
  }

  return (
    <Box>
      <Button onClick={onOpen}> New Job </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Start a Job</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              <Select
                name='workflow'
                variant='filled'
                value={job.workflow}
                onChange={handleInput}
                icon={<IoCaretDown />}
                placeholder='Select a Workflow'
              >
                {data?.workflows?.map(w => {
                  return (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  )
                })}
              </Select>
              <Input
                name='input'
                variant='filled'
                value={job.input}
                onChange={handleInput}
                placeholder='/mnt/nfs/test.mkv'
              />
              <Input
                name='output'
                variant='filled'
                value={job.output}
                onChange={handleInput}
                placeholder='s3://dev-bucket/folder'
              />
              {job.output.split('/').pop().includes('.') ? (
                <Alert rounded='md' status='warning'>
                  <AlertIcon />
                  {`The output should be a directory. Filenames are determined by the preset.`}
                </Alert>
              ) : null}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              mr={3}
              onClick={() => {
                setJobs({
                  input: '/home/brendan/tidal/test.mkv',
                  output: '/home/brendan/tidal',
                  workflow: '9e68f52d-8c2a-4a09-a137-e36fec55f248',
                })
              }}
            >
              Load Test Event
            </Button>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={submitJob}
              isLoading={loading}
              colorScheme='yellow'
              isDisabled={!job.workflow || !job.input || !job.output}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
