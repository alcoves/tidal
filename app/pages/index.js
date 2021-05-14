import { Box, Button, Flex, Heading } from '@chakra-ui/react'
import Layout from '../components/Layout';
import TidalJob from '../components/TidalJob';
import { IoAddCircleOutline } from 'react-icons/io5'

export default function Dashboard() {
  return (
    <Layout>
      <Box>
        <Heading as="h1" size="lg">Dashboard</Heading>
        <Flex m='2'>
          <Button size='sm' leftIcon={<IoAddCircleOutline size='1.3rrem' />}>
            Add
          </Button>
        </Flex>
        <TidalJob/>
      </Box>
    </Layout>
  )
}
