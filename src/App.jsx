import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast.jsx'
import useAuthStore from './store/authStore.js'

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

function ProtectedRoute({ children, requireOrg = false, requireSuperAdmin = false }) {
  const { token, org, user } = useAuthStore()

  if (!token) return <Navigate to="/login" replace />
  if (requireSuperAdmin && user?.role !== 'superadmin') return <Navigate to="/island" replace />
  if (requireOrg && !org) return <Navigate to={user?.role === 'superadmin' ? '/admin' : '/create-org'} replace />

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/accept/:token" element={<AcceptInvitePage />} />

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
