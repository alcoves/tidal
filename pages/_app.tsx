import '../styles/global.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import Head from 'next/head'
import theme from '../styles/theme'
import Layout from '../components/Layout'

function MyApp ({ Component, pageProps }: AppProps) {
  return (
    <>
    <Head>
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
      />
    </Head>
    <ChakraProvider cookies={pageProps.cookies} theme={theme}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
    </>
  )
}
export default MyApp
