import { Container, Heading } from '@chakra-ui/react'
import Layout from '../components/Layout';
import TidalJob from '../components/TidalJob';

export default function Dashboard() {
  return (
    <Layout>
      <Container>
        <Heading as="h1" size="lg">Dashboard</Heading>
        <TidalJob/>
      </Container>
    </Layout>
  )
}
