import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { LanguageProvider } from './context/LanguageContext'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App.jsx'
import './index.css'

// One-time cleanup script to wipe old mock data for clean connected testing slate
if (!localStorage.getItem('testing_clean_v6')) {
  localStorage.clear();
  localStorage.setItem('testing_clean_v6', 'true');
  localStorage.setItem('app_language', 'EN');
  console.log("Local storage re-initialized with rich connected seed data.");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
