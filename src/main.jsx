import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'
import './styles/island.css'
import { getMe } from './api/auth.js'
import useAuthStore from './store/authStore.js'

async function bootstrap() {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const { data } = await getMe()
      useAuthStore.getState().login(token, data.user)
      if (data.org) {
        useAuthStore.getState().setOrg(data.org, data.orgRole)
      }
    } catch {
      useAuthStore.getState().logout()
    }
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

bootstrap()
