import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import { BankProvider } from './auth/BankContext.jsx' // Import BankProvider
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BankProvider> {/* Wrap with BankProvider */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BankProvider>
  </React.StrictMode>,
)
