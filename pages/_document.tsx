import React from 'react';
import Document, {
  Html, Head, Main, NextScript, 
} from 'next/document';

export default class MyDocument extends Document {
  render() {
    return(
      <Html>
        <Head>
          <link rel='shortcut icon' href='./favicon.ico' />
          <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin='true'/>
          <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"/> 
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}