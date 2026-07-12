import client from './client.js'

export const login = (email, password) =>
  client.post('/auth/login', { email, password })

export const register = (display_name, email, password) =>
  client.post('/auth/register', { display_name, email, password })

export const getMe = () => client.get('/auth/me')
