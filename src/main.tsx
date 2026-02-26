import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/entry.tsx'
import { ThemeProvider } from './shared/context/ThemeContext.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="sarmad-admin-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>
)
