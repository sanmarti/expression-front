import client from './client.js'

export const getSubscription = () => client.get('/subscription')
export const getPlans = () => client.get('/subscription/plans')

export const adminGetOrgs = () => client.get('/admin/organizations')
export const adminGetUsers = () => client.get('/admin/users')
export const adminGetStats = () => client.get('/admin/stats')
export const adminDeleteOrg = (id) => client.delete(`/admin/organizations/${id}`)
export const adminUpdateSubscription = (id, plan) =>
  client.put(`/admin/subscriptions/${id}`, { plan_name: plan })
