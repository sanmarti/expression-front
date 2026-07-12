import client from './client.js'

export const getStakeholders = () => client.get('/stakeholders')
export const getStakeholder = (id) => client.get(`/stakeholders/${id}`)
export const createStakeholder = (data) => client.post('/stakeholders', data)
export const updateStakeholder = (id, data) => client.put(`/stakeholders/${id}`, data)
export const deleteStakeholder = (id) => client.delete(`/stakeholders/${id}`)
