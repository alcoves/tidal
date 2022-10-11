import {
  Box,
  Flex,
  Text,
  Heading,
  Accordion,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  AccordionButton,
} from '@chakra-ui/react'
import CreatePlayback from './CreatePlayback'

export default function Playbacks({ video }: { video: any }) {
  return (
    <Box w='100%' border='1px' borderColor='teal.400' rounded='md'>
      <Box p='4' bg='teal.400'>
        <Flex w='100%' justify='space-between'>
          <Heading size='md'>Playbacks</Heading>
          <CreatePlayback videoId={video.id} />
        </Flex>
        <Text> Playbacks ready for the web </Text>
      </Box>
      {video?.playbacks.map((p: any) => {
        return (
          <Accordion key={p.id} allowMultiple w='100%'>
            <AccordionItem border='none'>
              <AccordionButton>
                <Box flex='1' textAlign='left'>
                  <Text noOfLines={1}>{p.id}</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} overflowY='auto'>
                <pre>{JSON.stringify(p, null, 2)}</pre>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )
      })}
    </Box>
  )
}
