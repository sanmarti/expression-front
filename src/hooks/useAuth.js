import useAuthStore from '../store/authStore.js'

export function useAuth() {
  const { user, token, org, orgRole, login, logout, setOrg } = useAuthStore()
  return { user, token, org, orgRole, login, logout, setOrg, isAuthenticated: !!token }
}
