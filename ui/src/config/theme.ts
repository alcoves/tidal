import { extendTheme } from '@chakra-ui/react'

const _theme = {
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: true,
  },
  colors: {
    brand: {
      900: '#1a365d',
      800: '#153e75',
      700: '#2a69ac',
    },
  },
}

export const theme = extendTheme(_theme)
