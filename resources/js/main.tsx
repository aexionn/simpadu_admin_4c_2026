import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import "./styles/tailwind.css"; // Menghubungkan CSS tampilan

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
