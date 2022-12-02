import DeleteVideoAsset from './DeleteVideoAsset'

import { DateTime } from 'luxon'
import { useParams } from 'react-router-dom'
import { getVideo } from '../../services/getVideo'
import { useQuery } from '@tanstack/react-query'
import { Box, Text, Code, HStack, VStack, Heading, Spinner } from '@chakra-ui/react'

import Files from './Files'
import QueryError from '../QueryError'
import CreateFile from './CreateFile'
import Playbacks from './Playbacks'
// import Thumbnails from './Thumbnails'

export default function VideoAsset() {
  const { videoId } = useParams()
  const { data, error } = useQuery([videoId], getVideo)

  if (data && videoId) {
    return (
      <Box>
        <Heading size='lg'>Video Asset</Heading>
        <Code>{`GET /assets/videos/${videoId}`}</Code>
        <HStack mt='2' mb='10'>
          <CreateFile videoId={videoId} />
          <DeleteVideoAsset videoId={videoId} />
        </HStack>
        <Text>Asset Id: {data?.id}</Text>
        <Text>Created: {DateTime.fromISO(data?.createdAt).toFormat('ff')}</Text>
        <Text>Updated: {DateTime.fromISO(data?.updatedAt).toFormat('ff')}</Text>
        <VStack maxW='600px' mt='4' spacing='6'>
          <Files assets={data?.files || []} />
          <Playbacks video={data} />
          {/* <Input video={data} /> */}
          {/* <Thumbnails video={data} />
          <Playbacks video={data} />https://s3.rustyguts.net/tidal/assets/videos/a990fb9f-fd5a-44c7-a7cc-155522f1b252/playbacks/91759fe1-1201-46f7-817d-a7131013fd1d/main.m3u8
          <Encodes video={data} /> */}
        </VStack>
      </Box>
    )
  }

  if (error) return <QueryError error={error} />
  return <Spinner />
}
