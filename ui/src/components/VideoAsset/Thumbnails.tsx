import {
  Box,
  Text,
  Flex,
  Heading,
  Accordion,
  AccordionItem,
  AccordionIcon,
  AccordionPanel,
  AccordionButton,
} from '@chakra-ui/react'
import CreateThumbnail from './CreateThumbnail'

export default function Thumbnails({ video }: { video: any }) {
  const { thumbnails = [], id } = video
  return (
    <>
      <Box w='100%' border='1px' borderColor='teal.400' rounded='md'>
        <Box p='4' bg='teal.400'>
          <Flex w='100%' justify='space-between'>
            <Heading size='md'>Thumbnails</Heading>
          </Flex>
          <Flex w='100%' justify='space-between'>
            <Text> The thumbnails associated with this video </Text>
            <CreateThumbnail videoId={id} />
          </Flex>
        </Box>
        {thumbnails.map((t: any) => {
          return (
            <Accordion key={t.id} allowMultiple w='100%'>
              <AccordionItem border='none'>
                <AccordionButton>
                  <Box flex='1' textAlign='left'>
                    <Text noOfLines={1}>{t.id}</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} overflowY='auto'>
                  <pre>{JSON.stringify(t, null, 2)}</pre>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          )
        })}
      </Box>
    </>
  )
}
