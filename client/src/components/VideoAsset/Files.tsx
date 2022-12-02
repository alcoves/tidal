import RetryJob from '../RetryJob'

import {
  Box,
  Text,
  Flex,
  Badge,
  Heading,
  Accordion,
  AccordionItem,
  AccordionIcon,
  AccordionPanel,
  AccordionButton,
  HStack,
} from '@chakra-ui/react'
import { queues } from '../../config/global'
import VideoPlayer from '../VideoPlayer'

function getStatusBadgeColor(status: string) {
  switch (status.toLowerCase()) {
    case 'processing':
      return 'yellow'
    case 'ready':
      return 'green'
    case 'error':
      return 'red'
    default:
      return 'gray'
  }
}

export default function VideoFiles({ assets }: { assets: any[] }) {
  return (
    <>
      <Box w='100%' border='1px' borderColor='teal.400' rounded='md'>
        <Box p='4' bg='teal.400'>
          <Flex w='100%' justify='space-between'>
            <Heading size='md'>Files</Heading>
          </Flex>
          <Text> Files for your video </Text>
        </Box>
        {assets.map((r: any) => {
          return (
            <Accordion key={r.id} allowMultiple w='100%'>
              <AccordionItem border='none'>
                <AccordionButton>
                  <HStack flex='1' textAlign='left'>
                    <Badge
                      fontSize='1rem'
                      variant='solid'
                      colorScheme={getStatusBadgeColor(r.status)}
                    >
                      {r.type}
                    </Badge>
                    <Text noOfLines={1}>{r.id}</Text>
                  </HStack>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} overflowY='auto'>
                  {/* <RetryJob queueName={queues.transcodes} jobId={r.id} videoId={video.id} /> */}
                  <pre>{JSON.stringify(r, null, 2)}</pre>
                  <VideoPlayer
                    key={r.id}
                    src={`http://localhost:4566/${r.location.split('s3://')[1]}`}
                  />
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          )
        })}
      </Box>
    </>
  )
}