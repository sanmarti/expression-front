import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ToastProvider } from './components/ui/Toast.jsx'
import useAuthStore from './store/authStore.js'
import { getMe } from './api/auth.js'
import Spinner from './components/ui/Spinner.jsx'

import LandingPage from './pages/LandingPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import CreateOrgPage from './pages/CreateOrgPage.jsx'
import IslandPage from './pages/IslandPage.jsx'
import StakeholderPage from './pages/StakeholderPage.jsx'
import MembersPage from './pages/MembersPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import SubscriptionPage from './pages/SubscriptionPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import AcceptInvitePage from './pages/AcceptInvitePage.jsx'
import ChoosePilotPage from './pages/ChoosePilotPage.jsx'
import CockpitPage from './pages/CockpitPage.jsx'

function ProtectedRoute({ children, requireOrg = false, requireSuperAdmin = false }) {
  const { token, org, user } = useAuthStore()

  if (!token) return <Navigate to="/" replace />
  if (requireSuperAdmin && user?.role !== 'superadmin') return <Navigate to="/island" replace />
  if (requireOrg && !org) return <Navigate to={user?.role === 'superadmin' ? '/admin' : '/create-org'} replace />

  return children
}

export default function App() {
  const { token, user, setUser, setOrg, logout } = useAuthStore()
  const [hydrating, setHydrating] = useState(!!token && !user)

  useEffect(() => {
    if (!token || user) { setHydrating(false); return }
    getMe()
      .then(({ data }) => {
        setUser({ id: data.id, email: data.email, display_name: data.display_name, avatar_url: data.avatar_url, selected_avatar: data.selected_avatar, role: data.role })
        if (data.org_id) setOrg({ id: data.org_id, name: data.org_name, slug: data.slug }, data.org_role)
      })
      .catch(() => logout())
      .finally(() => setHydrating(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (hydrating) {
    return (
      <div style={{ minHeight: '100vh', background: '#0B1120', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size={40} />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/accept/:token" element={<AcceptInvitePage />} />
          <Route path="/choose-pilot" element={<ProtectedRoute><ChoosePilotPage /></ProtectedRoute>} />
          <Route path="/cockpit" element={<ProtectedRoute requireOrg><CockpitPage /></ProtectedRoute>} />

          <Route
            path="/create-org"
            element={
              <ProtectedRoute>
                <CreateOrgPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/island"
            element={
              <ProtectedRoute requireOrg>
                <IslandPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stakeholders/:id"
            element={
              <ProtectedRoute requireOrg>
                <StakeholderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/members"
            element={
              <ProtectedRoute requireOrg>
                <MembersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <ProtectedRoute requireOrg>
                <SubscriptionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireSuperAdmin>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}
