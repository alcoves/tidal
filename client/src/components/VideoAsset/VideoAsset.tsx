import DeleteVideoAsset from './DeleteVideoAsset'

import { DateTime } from 'luxon'
import { useParams } from 'react-router-dom'
import { getVideo } from '../../services/getVideo'
import { useQuery } from '@tanstack/react-query'
import { Box, Text, Code, HStack, VStack, Heading, Spinner } from '@chakra-ui/react'

import Renditions from './Renditions'
import QueryError from '../QueryError'
import CreateRendition from './CreateRendition'
// import Thumbnails from './Thumbnails'
// import Playbacks from './Playbacks'

export default function VideoAsset() {
  const { videoId } = useParams()
  const { data, error } = useQuery([videoId], getVideo)

  if (data && videoId) {
    return (
      <Box>
        <Heading size='lg'>Video Asset</Heading>
        <Code>{`GET /assets/videos/${videoId}`}</Code>
        <HStack mt='2' mb='10'>
          <CreateRendition videoId={videoId} />
          <DeleteVideoAsset videoId={videoId} />
        </HStack>
        <Text>Asset Id: {data?.id}</Text>
        <Text>Created: {DateTime.fromISO(data?.createdAt).toFormat('ff')}</Text>
        <Text>Updated: {DateTime.fromISO(data?.updatedAt).toFormat('ff')}</Text>
        <VStack maxW='600px' mt='4' spacing='6'>
          <Renditions renditions={data?.renditions || []} />
          {/* <Input video={data} /> */}
          {/* <Thumbnails video={data} />
          <Playbacks video={data} />
          <Encodes video={data} /> */}
        </VStack>
      </Box>
    )
  }

  if (error) return <QueryError error={error} />
  return <Spinner />
}
