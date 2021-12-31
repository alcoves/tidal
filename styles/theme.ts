import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {
      900: '#1a365d',
      800: '#153e75',
      700: '#2a69ac',
      red: '#bf1e2e',
    },
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  fonts: {
    body: 'Fira Code',
    mono: 'Fira Code',
    heading: 'Fira Code',
  },
})

export default theme
