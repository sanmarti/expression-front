import useAuthStore from '../store/authStore.js'

export function useOrganization() {
  const { org, orgRole } = useAuthStore()
  return {
    org,
    orgRole,
    isAdmin: orgRole === 'admin',
    isSuperAdmin: useAuthStore.getState().user?.role === 'superadmin',
  }
}
