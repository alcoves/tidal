import AddJob from './AddJob'

import { useQuery } from '@tanstack/react-query'
import { getVideos } from '../services/getVideos'
import {
  Box,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

export default function VideoAssets() {
  const navigate = useNavigate()
  const { data } = useQuery(['videos'], getVideos)

  return (
    <Box>
      <Flex w='100%' align='start' justify='space-between'>
        <Heading size='lg'>Video Assets</Heading>
        <AddJob />
      </Flex>
      <Box pt='4'>
        <TableContainer>
          <Table size='sm'>
            <Thead>
              <Tr>
                <Th></Th>
                <Th>ID</Th>
                <Th>Input</Th>
                <Th>Created</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data?.videos?.map((v: any) => {
                return (
                  <Tr
                    onClick={() => {
                      navigate(`/assets/videos/${v.id}`)
                    }}
                    _hover={{
                      cursor: 'pointer',
                      background: 'gray.700',
                    }}
                  >
                    <Td>Thumbnail</Td>
                    <Td>{v.id}</Td>
                    <Td>Status</Td>
                    <Td>{v.createdAt}</Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}
