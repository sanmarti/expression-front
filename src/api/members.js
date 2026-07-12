import client from './client.js'

export const getMembers = () => client.get('/members')
export const inviteMember = (email, role) => client.post('/members/invite', { email, role })
export const removeMember = (id) => client.delete(`/members/${id}`)
export const getInvitations = () => client.get('/members/invitations')
export const cancelInvitation = (id) => client.delete(`/members/invitations/${id}`)
export const acceptInvite = (token) => client.post(`/members/accept/${token}`)
