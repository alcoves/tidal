import React from 'react';
import theme from '../styles/theme';
import { ColorModeScript, } from '@chakra-ui/react';
import Document, { Html, Head, Main, NextScript, } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return(
      <Html>
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta name="description" content="User interface for tidal" />
          <link rel='preconnect' href='https://fonts.gstatic.com' />
          <link href='https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600;700;800&display=swap' rel='stylesheet' />
        </Head>
        <body>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}