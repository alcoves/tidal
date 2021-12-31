import { Button, ButtonGroup, CircularProgress, Code, Flex } from '@chakra-ui/react'
import axios from 'axios'

export default function Job({ job }: { job: any }) {
  async function handleStartJob() {
    try {
      const res = await axios.post(`/api/jobs/${job.id}`)
      console.log('Start Job Response', res)
    } catch (error) {
      console.error(error)
    }
  }

  function progressColor() {
    if (job.status === 'ERROR') {
      return 'red.500'
    }
    if (job.status === 'READY') {
      return 'green.500'
    }
    if (job.status === 'PROCESSING') {
      return 'yellow.500'
    }
    return 'gray.500'
  }

  return (
    <Flex direction='column' p='4' w='100%' borderRadius={4} bg='gray.900'>
      <Flex>
        <CircularProgress
          mr='2'
          size='25px'
          thickness='10px'
          value={job.progress}
          color={progressColor()}
        />
        <Flex>{job.id}</Flex>
        <ButtonGroup size='xs'>
          <Button onClick={handleStartJob}> Start </Button>
          <Button isDisabled={true}> Stop </Button>
        </ButtonGroup>
      </Flex>
      <Flex direction='column' mt='2'>
        <Code>id: {job.id}</Code>
        <Code>status: {job.status}</Code>
        <Code>progress: {job.progress}</Code>
        <Code>input: {job.input}</Code>
        <Code>output: {job.output}</Code>
        <Code>cmd: {job.cmd}</Code>
        <Code>externalId: {job.externalId}</Code>
      </Flex>
    </Flex>
  )
}
