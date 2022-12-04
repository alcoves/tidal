import {
  Box,
  Flex,
  Text,
  Badge,
  Heading,
  Accordion,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  AccordionButton,
} from '@chakra-ui/react'
import CreatePlayback from './CreatePlayback'

export default function Packages({ video }: { video: any }) {
  return (
    <Box w='100%' border='1px' borderColor='teal.400' rounded='md'>
      <Box p='4' bg='teal.400'>
        <Flex w='100%' justify='space-between'>
          <Heading size='md'>Packages</Heading>
          <CreatePlayback videoId={video.id} />
        </Flex>
        <Text> Packages ready for the web </Text>
      </Box>
      {video?.packages.map((p: any) => {
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
                {/* {p?.transcodes?.map((t: any) => {
                  return (
                    <Flex py='2' justify='space-between' w='100%' key={t.id}>
                      <Badge>{t.id}</Badge>
                      <Badge>{t.status}</Badge>
                    </Flex>
                  )
                })} */}
                {/* <VideoPlayer key={p.id} src={getMainPlayback(p.id)} /> */}
                <pre>{JSON.stringify(p, null, 2)}</pre>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )
      })}
    </Box>
  )
}
