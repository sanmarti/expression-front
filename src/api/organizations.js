import client from './client.js'

export const createOrg = (data) => client.post('/organizations', data)
export const getOrg = (id) => client.get(`/organizations/${id}`)
export const updateOrg = (id, data) => client.put(`/organizations/${id}`, data)
