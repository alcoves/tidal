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
} from '@chakra-ui/react'

function getStatusBadgeColor(status: string) {
  switch (status.toLowerCase()) {
    case 'processing':
      return 'yellow'
    case 'ready':
      return 'blue'
    case 'error':
      return 'red'
    default:
      return 'gray'
  }
}

export default function SourceAsset({ video }: { video: any }) {
  return (
    <>
      <Box w='100%' border='1px' borderColor='teal.500' rounded='md'>
        <Box p='4' bg='teal.500'>
          <Flex w='100%' justify='space-between'>
            <Heading size='md'>Source</Heading>
            <Badge fontSize='1rem' variant='solid' colorScheme={getStatusBadgeColor(video.status)}>
              {video.status}
            </Badge>
          </Flex>
          <Text> The source file used for processing </Text>
        </Box>
        <Accordion allowMultiple w='100%'>
          <AccordionItem border='none'>
            <AccordionButton>
              <Box flex='1' textAlign='left'>
                <Text noOfLines={1}>{video.input}</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} overflowY='auto'>
              <pre>{JSON.stringify(video, null, 2)}</pre>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>
    </>
  )
}
