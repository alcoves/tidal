import { DateTime } from 'luxon'
import {
  Box,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  Flex,
  VStack,
  Button,
  Text,
  HStack,
} from '@chakra-ui/react'
import useSWR from 'swr'
import { fetcher } from '../../utils/fetcher'
import { useState } from 'react'

function ParentJob({ job, children }) {
  return (
    <Flex
      p='2'
      w='100%'
      direction='column'
      rounded='md'
      borderWidth='1px'
      borderStyle='solid'
      borderColor='gray.700'
    >
      <Heading size='sm'>{job.name}</Heading>
      <Flex direction='column'>
        <Heading size='sm'>Dependents</Heading>
        <RecursiveComponent job={job} children={children} level={0} />
      </Flex>
    </Flex>
  )
}

const RecursiveComponent = ({ job, children, level }) => {
  const hasChildren = children && children.length

  return (
    <Box pl={level * 2} key={job.id}>
      <HStack align='center'>
        <Text>{job?.name}</Text>
        <Progress
          w='50px'
          rounded='sm'
          value={job.progress}
          hasStripe={job.progress !== 100 ? true : false}
          isAnimated={job.progress !== 100 ? true : false}
          colorScheme={job.progress === 100 ? 'green' : 'blue'}
        />
      </HStack>
      {hasChildren &&
        children.map(i => <RecursiveComponent key={i.job.id} {...i} level={level + 1} />)}
    </Box>
  )
}

function JobTable({ jobs = [] }) {
  return (
    <VStack spacing={2} align='start'>
      {jobs.map(job => (
        <Flex key={job.id} direction='column'>
          <Flex>
            <Box>{job.name}</Box>
            <Box>{job.id}</Box>
            <Box>
              <Progress
                rounded='sm'
                value={job.progress}
                hasStripe={job.progress !== 100 ? true : false}
                isAnimated={job.progress !== 100 ? true : false}
              />
            </Box>
          </Flex>
          <Flex>
            <Box>Timestamp: {DateTime.fromMillis(job.timestamp).toFormat('M/d/yy hh:mm:ss')}</Box>
            <Box>
              Finished On: {DateTime.fromMillis(job.finishedOn).toFormat('M/d/yy hh:mm:ss')}
            </Box>
            <Box>
              Processed On: {DateTime.fromMillis(job.processedOn).toFormat('M/d/yy hh:mm:ss')}
            </Box>
            <Box>Parent ID: {job.opts?.parent?.id}</Box>
          </Flex>
        </Flex>
      ))}
    </VStack>
  )
}

export default function TranscodeQueue() {
  const [view, setView] = useState('table')
  const { data } = useSWR(`/jobs/transcode?sort=${view}`, fetcher, { refreshInterval: 2000 })

  if (!data) {
    return null
  } else if (view === 'table') {
    return (
      <Box mb='2'>
        <Heading mb='2'>Transcode Jobs</Heading>
        <Button size='sm' onClick={() => setView('hierarchy')}>{`Toggle View: ${view}`}</Button>
        <Tabs defaultIndex={1}>
          <TabList>
            {data?.map(({ name, jobs }) => {
              return <Tab key={name}>{`${name} (${jobs.length})`}</Tab>
            })}
          </TabList>
          <TabPanels>
            {data?.map(({ name, jobs }) => {
              return (
                <TabPanel key={name}>
                  <JobTable jobs={jobs} />
                </TabPanel>
              )
            })}
          </TabPanels>
        </Tabs>
      </Box>
    )
  } else if (view === 'hierarchy') {
    return (
      <Box mb='2'>
        <Heading mb='2'>Transcode Jobs</Heading>
        <Button size='sm' onClick={() => setView('table')}>{`Toggle View: ${view}`}</Button>
        <VStack align='start' spacing={2} mt='2'>
          {data?.length &&
            data.map(i => {
              return <ParentJob key={i.job.id} {...i} />
            })}
        </VStack>
      </Box>
    )
  }

  return null
}
