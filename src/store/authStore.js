import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  org: null,
  orgRole: null,

  login: (token, user) => {
    localStorage.setItem('token', token)
    set({ token, user })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null, org: null, orgRole: null })
    window.location.href = '/'
  },

  setOrg: (org, role) => set({ org, orgRole: role }),
}))

export default useAuthStore
