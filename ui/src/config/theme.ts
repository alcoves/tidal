import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: true,
  },
  fonts: {
    body: `'Nunito', serif`,
    heading: `'Nunito Sans', sans-serif`,
  },
  // colors: {
  // https://smart-swatch.netlify.app/#ffcc00
  // brand: {
  //   50: '#dff5fd',
  //   100: '#bde2f0',
  //   200: '#99d0e4',
  //   300: '#73c1d8',
  //   400: '#4fb3cc',
  //   500: '#379eb3',
  //   600: '#277e8c',
  //   700: '#185565',
  //   800: '#052f3e',
  //   900: '#000f18',
  // },
  // },
})
