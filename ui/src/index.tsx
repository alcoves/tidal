import ReactDOM from 'react-dom'

import { App } from './App'
import { theme } from './theme'
import { BrowserRouter as Router } from 'react-router-dom'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'

ReactDOM.render(
  <>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <Router basename='/ui'>
        <App />
      </Router>
    </ChakraProvider>
  </>,
  document.getElementById('root')
)
