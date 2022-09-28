import '@fontsource/nunito'
import '@fontsource/nunito-sans'

import React from 'react'
import App from './components/App'
import ReactDOM from 'react-dom/client'
import reportWebVitals from './reportWebVitals'

import { theme } from './config/theme'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'

const queryClient = new QueryClient()

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <App />
        </QueryClientProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
)

reportWebVitals()
