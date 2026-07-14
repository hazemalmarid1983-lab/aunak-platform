import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { bootstrapMasterBypassFromUrl } from './lib/sovereignMasterBypass.js'
import { applyDocumentLang, getStoredLang } from './lib/locale.js'

bootstrapMasterBypassFromUrl()
applyDocumentLang(getStoredLang())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
