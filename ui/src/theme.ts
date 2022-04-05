import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
    modes: {
      dark: {
        background: '#212c34',
      },
    },
  },
  fonts: {
    heading: 'Fira Sans, sans-serif',
    body: 'Fira Sans, sans-serif',
  },
  colors: {
    yellow: {
      50: '#ffcc00',
      100: '#ffcc00',
      200: '#ffcc00',
      300: '#ffcc00',
      400: '#ffcc00',
      500: '#ffcc00',
      600: '#ffcc00',
      700: '#ffcc00',
      800: '#ffcc00',
      900: '#ffcc00',
    },
    red: {
      50: '#bf1e2e',
      100: '#bf1e2e',
      200: '#bf1e2e',
      300: '#bf1e2e',
      400: '#bf1e2e',
      500: '#bf1e2e',
      600: '#bf1e2e',
      700: '#bf1e2e',
      800: '#bf1e2e',
      900: '#bf1e2e',
    },
    gray: {
      50: '#f7f9fa',
      100: '#c7d3db',
      200: '#a3b6c5',
      300: '#7f9aae',
      400: '#5e7d94',
      500: '#4f697c',
      600: '#3f5564',
      700: '#30404c',
      800: '#212c34',
      900: '#12181c',
    },
  },
  components: {
    Button: {
      baseStyle: {
        letterSpacing: '.08rem',
      },
    },
  },
})
