import AddJob from './AddJob'

import { DateTime } from 'luxon'
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
  Image,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { getThumbnailUrlFromS3Uri } from '../config/utils'

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
                <Th>Status</Th>
                <Th>Created</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data?.videos?.map((v: any) => {
                return (
                  <Tr
                    key={v.id}
                    onClick={() => {
                      navigate(`/assets/videos/${v.id}`)
                    }}
                    _hover={{
                      cursor: 'pointer',
                      background: 'gray.700',
                    }}
                  >
                    <Td>
                      {/* <Image
                        w='100px'
                        alt='thumbnail'
                        objectFit='cover'
                        src={getThumbnailUrlFromS3Uri(
                          v?.thumbnails.length ? v?.thumbnails[0]?.s3Uri : ''
                        )}
                      /> */}
                    </Td>
                    <Td>{v.id}</Td>
                    <Td>{v.status}</Td>
                    <Td>{DateTime.fromISO(v.createdAt).toFormat('ff')}</Td>
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
