import React from 'react';
import Document, { Html, Head, Main, NextScript, } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return(
      <Html>
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta name="description" content="User interface for tidal" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}