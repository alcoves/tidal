import { Box, Button, Flex, Heading } from '@chakra-ui/react'
import Layout from '../components/Layout';
import TidalJob from '../components/TidalJob';
import { IoAddCircleOutline } from 'react-icons/io5'

export default function Dashboard({ jobs }) {
  console.log('jobs', jobs);
  return (
    <Layout>
      <Box>
        <Heading as="h1" size="lg">Dashboard</Heading>
        <Flex m='2'>
          <Button size='sm' leftIcon={<IoAddCircleOutline size='1.3rem' />}>
            Add
          </Button>
        </Flex>
        {jobs.map((j) => {
          return <TidalJob key={j.Value.id} job={j} />
        })}
      </Box>
    </Layout>
  )
}

export async function getServerSideProps() {
  const res = await fetch(`http://localhost:3000/api/jobs`)
  const data = await res.json()
  console.log('data', data);
  return { props: { jobs: data.jobs }}
}
