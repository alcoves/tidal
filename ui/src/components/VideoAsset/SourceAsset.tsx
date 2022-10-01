import {
  Box,
  Text,
  Heading,
  Accordion,
  AccordionItem,
  AccordionIcon,
  AccordionPanel,
  AccordionButton,
  Flex,
  Badge,
} from '@chakra-ui/react'

export default function SourceAsset({ source }: { source: any }) {
  return (
    <>
      <Box w='100%' border='1px' borderColor='teal.500' rounded='md'>
        <Box p='4' bg='teal.500'>
          <Flex w='100%' justify='space-between'>
            <Heading size='md'>Source</Heading>
            <Badge fontSize='1rem' variant='solid' colorScheme='yellow'>
              READY
            </Badge>
          </Flex>
          <Text> The source file used for processing </Text>
        </Box>
        <Accordion allowMultiple w='100%'>
          <AccordionItem border='none'>
            <AccordionButton>
              <Box flex='1' textAlign='left'>
                <Text noOfLines={1}>{source.url}</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} overflowY='auto'>
              <pre>{JSON.stringify(source, null, 2)}</pre>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>
    </>
  )
}
