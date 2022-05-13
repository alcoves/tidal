import useSWR from 'swr'
import { fetcher } from '../utils/fetcher'
import WorkflowRow from './Workflows/WorkflowRow'
import CreateWorkflow from './Workflows/CreateWorkflow'
import { Box, Heading, HStack, Stack } from '@chakra-ui/react'

export default function Workflows() {
  const { data } = useSWR('/workflows', fetcher)

  return (
    <Box>
      <Box mb='2'>
        <Heading mb='2'>Workflows</Heading>
        <Stack>
          <HStack justify='end'>
            <CreateWorkflow />
          </HStack>
          {data?.workflows.map(p => {
            return <WorkflowRow key={p.id} workflow={p} />
          })}
        </Stack>
      </Box>
    </Box>
  )
}
