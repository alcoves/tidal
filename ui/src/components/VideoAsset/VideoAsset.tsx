import DeleteVideoAsset from './DeleteVideoAsset'

import { DateTime } from 'luxon'
import { useParams } from 'react-router-dom'
import { getVideo } from '../../services/getVideo'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Text,
  Code,
  Alert,
  HStack,
  VStack,
  Heading,
  Spinner,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import SourceAsset from './SourceAsset'

export default function VideoAsset() {
  const { videoId } = useParams()
  const { data, error } = useQuery([videoId], getVideo)

  console.log(error)

  if (data && videoId) {
    return (
      <Box>
        <Heading size='lg'>Video Asset</Heading>
        <Code>{`GET /assets/videos/${videoId}`}</Code>
        <HStack mt='2' mb='10'>
          <DeleteVideoAsset videoId={videoId} />
        </HStack>
        <Text>Asset Id: {data?.id}</Text>
        <Text>Created: {DateTime.fromISO(data?.createdAt).toFormat('ff')}</Text>
        <Text>Updated: {DateTime.fromISO(data?.updatedAt).toFormat('ff')}</Text>
        <VStack maxW='600px' mt='4' spacing='6'>
          <SourceAsset source={data.source} />
        </VStack>
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Alert status='error'>
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{JSON.stringify(error)}</AlertDescription>
        </Alert>
      </Box>
    )
  }

  return <Spinner />
}
