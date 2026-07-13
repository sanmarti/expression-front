import client from './client.js'

export const getCockpitQuestions = () => client.get('/cockpit/questions')
export const submitCockpitAnswers = (answers) => client.post('/cockpit/answers', { answers })
export const getCockpitScore = () => client.get('/cockpit/score')

export const adminGetCockpitQuestions = () => client.get('/admin/cockpit/questions')
export const adminCreateCockpitQuestion = (data) => client.post('/admin/cockpit/questions', data)
export const adminUpdateCockpitQuestion = (id, data) => client.put(`/admin/cockpit/questions/${id}`, data)
export const adminDeleteCockpitQuestion = (id) => client.delete(`/admin/cockpit/questions/${id}`)

export const adminGetGroups = () => client.get('/admin/cockpit/groups')
export const adminCreateGroup = (data) => client.post('/admin/cockpit/groups', data)
export const adminUpdateGroup = (id, data) => client.put(`/admin/cockpit/groups/${id}`, data)
export const adminDeleteGroup = (id) => client.delete(`/admin/cockpit/groups/${id}`)
export const adminAddQuestionToGroup = (groupId, data) => client.post(`/admin/cockpit/groups/${groupId}/questions`, data)
