import client from './client.js'

export const getClimate = (stakeholderId) =>
  client.get(`/stakeholders/${stakeholderId}/climate`)

export const updateClimate = (stakeholderId, data) =>
  client.put(`/stakeholders/${stakeholderId}/climate`, data)

export const getClimateHistory = (stakeholderId) =>
  client.get(`/stakeholders/${stakeholderId}/climate/history`)

export const getStatusRules = () => client.get('/admin/status-rules')
export const updateStatusRules = (data) => client.put('/admin/status-rules', data)
