import { Heading, Container, Flex, Textarea, Text, Button, Box } from "@chakra-ui/react"
import Layout from '../components/Layout';
import { IoEllipse } from 'react-icons/io5';
import { useState } from 'react';

export default function Home({ data }) {
  const [settings, setSettings] = useState(data?.config)

  return (
    <Layout>
      <Box>
        <Heading as="h1" size="lg">Settings</Heading>
        <Flex flexDirection='column' my='10px'>
          <Flex alignItems='center'>
            <IoEllipse style={{ fill: data?.nomadUp ? "#38A169" : '#E53E3E' }}/>
            <Text pl='3px' fontWeight='600' fontSize='.8em' textTransform='uppercase' >Nomad</Text>
          </Flex>
          <Flex alignItems='center'>
            <IoEllipse style={{ fill: data?.consulUp ? "#38A169" : '#E53E3E' }}/>
            <Text pl='3px' fontWeight='600' fontSize='.8em' textTransform='uppercase' >Consul</Text>
          </Flex>
        </Flex>

        <Box>
          <Heading mb='5px' as="h4" size="sm">Tidal Global Config</Heading>
          <Textarea minW='100%' placeholder={settings} onChange={(e) => setSettings(e.target.value)} />
        </Box>

        <Box my='10px'>
          <Button colorScheme="green" variant="outline">
            Save
          </Button>
        </Box>
      </Box>
    </Layout>
  )
}

export async function getServerSideProps() {
  const res = await fetch(`http://localhost:3000/api/config`)
  const data = await res.json()
  return { props: { data }}
}
