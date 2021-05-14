import { Flex, Box, Button, Heading, Progress, Stack, Badge, Text } from '@chakra-ui/react';
import { IoCheckmarkOutline, IoRadioButtonOff  } from 'react-icons/io5';

const data = {
  id: 'klawDJKAWdkoap',
  totalProgress: 72,
  jobs: [
    {
      name: "setup",
      status: 'completed'
    },
    {
      name: "segmenting",
      status: "completed"
    },
    {
      name: "transcoding",
      status: "completed",
    },
    {
      name: "concatinating",
      status: "running"
    },
    {
      name: "packaging",
      status: "pending"
    }
  ],
  framerate: 24.976,
  resolutions: ["260p", "480p", "720p", "1080p", "1440p", "2160p"]
}

export default function TidalJob() {
  const {id, totalProgress, jobs, resolutions, framerate} = data
  return (
    <Box p='4'>
      <Heading size='md'>{id}</Heading>

      <Flex my='2' alignItems='end'>
        <Stack direction="row">
          <Badge colorScheme="green">{framerate} FPS</Badge>
          {resolutions.map((r) => {
            return <Badge colorScheme="blue">{r}</Badge>
          })}
        </Stack>
      </Flex>

      <Flex justifyContent='space-between' my='4'>
        <Stack direction="row" spacing={10}>
          {jobs.map(j => {
            return (
              <Flex w='100' alignItems='center' flexDirection='column'>
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