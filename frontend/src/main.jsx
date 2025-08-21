import { StrictMode } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { ChakraProvider } from '@chakra-ui/react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChakraProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ChakraProvider>
  </StrictMode>,
)
