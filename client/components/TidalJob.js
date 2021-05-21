import { Flex, Box, Button, Heading, Progress, Stack, Badge, Text } from '@chakra-ui/react';
import { IoCheckmarkOutline, IoRadioButtonOff  } from 'react-icons/io5';

export default function TidalJob({ job }) {
  const { id, totalProgress, jobs, resolutions, framerate } = job.Value;
  return (
    <Box p='4'>
      <Heading size='md'>{id}</Heading>

      <Flex my='2' alignItems='end'>
        <Stack direction="row">
          <Badge colorScheme="green">{framerate} FPS</Badge>
          {resolutions.map((r) => {
            return <Badge key={r} colorScheme="blue">{r}</Badge>
          })}
        </Stack>
      </Flex>

      <Flex justifyContent='space-between' my='4'>
        <Stack direction="row" spacing={10}>
          {jobs.map(j => {
            return (
              <Flex key={j.name} w='100' alignItems='center' flexDirection='column'>
                {j.status === "completed" ? <IoCheckmarkOutline size='1.5rem'/> : <IoRadioButtonOff size='1.5rem'/>}
                <Text textTransform='uppercase' fontSize='.8rem' fontWeight='700'> {j.name}</Text>
              </Flex>
            )
          })}
          </Stack>
      </Flex>

      <Flex my='2' justifyContent='end'>
        <Stack direction="row">
        <Button size='sm'>
          Retry
        </Button>
        <Button size='sm' colorScheme="red" disabled={totalProgress === 100}>
          Cancel
        </Button>
        </Stack>
      </Flex>
      <Progress rounded='md' size="xs" isAnimated hasStripe value={totalProgress} />
    </Box>
  )
}