import {
  Box,
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Progress,
} from '@chakra-ui/react'
import useSWR from 'swr'
import { fetcher } from '../../utils/fetcher'

function JobTable({ jobs = [] }) {
  return (
    <TableContainer>
      <Table size='sm'>
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Name</Th>
            <Th>Progress</Th>
            <Th>Timestamp</Th>
            <Th>Finished On</Th>
            <Th>Processed On</Th>
            <Th>Parent ID</Th>
          </Tr>
        </Thead>
        <Tbody>
          {jobs.map(job => (
            <Tr key={job.id}>
              <Td>{job.id}</Td>
              <Td>{job.name}</Td>
              <Td>
                <Progress rounded='sm' value={job.progress} />
              </Td>
              <Td>{job.timestamp}</Td>
              <Td>{job.finishedOn}</Td>
              <Td>{job.processedOn}</Td>
              <Td>{job.opts?.parent?.id}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}

export default function TranscodeQueue() {
  const { data } = useSWR('/jobs/transcode', fetcher, { refreshInterval: 2000 })

  if (!data) return null
  return (
    <Box>
      <Box mb='2'>
        <Heading mb='2'>Transcode Jobs</Heading>
        <Tabs>
          <TabList>
            {data?.map(({ name, jobs }) => {
              return <Tab key={name}>{`${name} (${jobs.length})`}</Tab>
            })}
          </TabList>
          <TabPanels>
            {data?.map(({ name, jobs }) => {
              return (
                <TabPanel key={name}>
                  <JobTable jobs={jobs} />
                </TabPanel>
              )
            })}
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  )
}
