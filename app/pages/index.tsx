import Head from 'next/head'
import { Box, Container, Flex } from '@chakra-ui/react';

export default function Home() {
  return (
    <>
      <Head>
        <title>Tidal Media Server</title>
        <meta name="description" content="Tidal Media Server" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex w='100%' h='100%' justify='center'>
      <Container border='black 1px solid'>
          Test adawdawdaw
      </Container>
      </Flex>
    </>
  )
}
