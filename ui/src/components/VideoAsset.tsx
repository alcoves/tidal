import { useParams } from 'react-router-dom'
import { getVideo } from '../services/getVideo'
import { useQuery } from '@tanstack/react-query'
import { Box, Heading, Spinner, Text } from '@chakra-ui/react'

export default function VideoAsset() {
  const { videoId } = useParams()
  const { data } = useQuery([videoId], getVideo)

  if (data) {
    return (
      <Box>
        <Heading size='lg'>Video Asset</Heading>
        <Text>Asset Id: {data?.id}</Text>
        <Text>Created: {data?.createdAt}</Text>
        <Text>Updated: {data?.updatedAt}</Text>
        <Text>Input: {data?.input}</Text>
      </Box>
    )
  }

  return <Spinner />
}
