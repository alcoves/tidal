import QueryError from '../QueryError'
import {
  Tr,
  Td,
  Th,
  Box,
  Text,
  Table,
  Thead,
  Tbody,
  Heading,
  TableContainer,
} from '@chakra-ui/react'
import { getQueue } from '../../services/api'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'

export default function Queue() {
  const navigate = useNavigate()
  const { queueName } = useParams()
  const { data, error } = useQuery([queueName], getQueue)

  if (data) {
    return (
      <Box>
        <Heading size='lg'>{`${queueName} Queue`}</Heading>
        <Text>This page lists the jobs of a given queue</Text>

        <Heading size='md'>Jobs</Heading>
        <TableContainer>
          <Table size='sm'>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>ID</Th>
                <Th isNumeric>Progress</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data?.jobs?.map((j: any) => {
                return (
                  <Tr
                    onClick={() => {
                      navigate(`/queues/${queueName}/jobs/${j?.id}`)
                    }}
                    _hover={{
                      cursor: 'pointer',
                      background: 'gray.700',
                    }}
                  >
                    <Td>{j?.name}</Td>
                    <Td>{j?.id}</Td>
                    <Td isNumeric>{j?.progress}</Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </TableContainer>
        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      </Box>
    )
  }

  if (error) return <QueryError error={error} />
  return null
}
