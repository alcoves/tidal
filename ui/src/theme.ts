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
    heading: 'PT Mono, monospace',
    body: 'PT Mono, monospace',
  },
  colors: {
    brand: {
      yellow: '#ffcc00',
      gray: '#212c34',
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
})
