import {
  Th,
  Td,
  Tr,
  Box,
  Thead,
  Table,
  Tbody,
  Heading,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react'
import { getQueues } from '../../services/api'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

const bullMqJobStatus = [
  'active',
  'completed',
  'delayed',
  'failed',
  'paused',
  'waiting',
  'waiting-children',
]

export default function Queues() {
  const navigate = useNavigate()
  const { data } = useQuery(['queues'], getQueues)
  return (
    <Box>
      <Heading size='lg'>Queues</Heading>
      <TableContainer>
        <Table variant='simple'>
          <TableCaption>List of queues and their job counts</TableCaption>
          <Thead>
            <Tr>
              <Th>Name</Th>
              {bullMqJobStatus.map(status => {
                return <Th isNumeric>{status}</Th>
              })}
            </Tr>
          </Thead>
          <Tbody>
            {data?.queues?.map((q: any) => (
              <Tr
                onClick={() => {
                  navigate(`/queues/${q.name}`)
                }}
                _hover={{
                  cursor: 'pointer',
                  background: 'gray.700',
                }}
              >
                <Td>{q.name}</Td>
                {Object.entries(q.counts).map(([k, v]) => {
                  return <Th isNumeric>{v as number}</Th>
                })}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  )
}
