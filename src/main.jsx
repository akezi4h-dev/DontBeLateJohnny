import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './hooks/useAuth.jsx'

window.OneSignalDeferred = window.OneSignalDeferred || []
window.OneSignalDeferred.push(async function (OneSignal) {
  await OneSignal.init({
    appId: 'YOUR_ONESIGNAL_APP_ID',
    notifyButton: { enable: false },
  })
})

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/DontBeLateJohnny/sw.js')
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
