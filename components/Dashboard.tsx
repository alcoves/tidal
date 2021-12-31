import AddJob from './AddJob'
import ListJobs from './ListJobs'
import { Flex } from '@chakra-ui/react'

export default function Dashboard() {
  return (
    <Flex direction='column' w='100%' p='4'>
      <Flex justify='end'>
        <AddJob />
      </Flex>
      <ListJobs />
    </Flex>
  )
}
