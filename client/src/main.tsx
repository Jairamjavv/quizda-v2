import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { NotificationProvider } from './context/NotificationContext'
import './theme/designTokens.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </React.StrictMode>
)
