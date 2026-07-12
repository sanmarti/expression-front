import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin } from '../api/auth.js'
import { getMe } from '../api/auth.js'
import useAuthStore from '../store/authStore.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, setOrg } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 8, marginTop: 6,
    background: '#0B1120', border: '1px solid #1C2B45',
    color: 'rgba(255,255,255,0.92)', fontSize: 14, outline: 'none', display: 'block',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await apiLogin(form.email, form.password)
      login(data.token, data.user)
      const me = await getMe()
      if (me.data.org_id) setOrg({ id: me.data.org_id, name: me.data.org_name, slug: me.data.slug }, me.data.org_role)
      if (me.data.role === 'superadmin') navigate('/admin')
      else if (me.data.org_id) navigate('/island')
      else navigate('/create-org')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#141E35', border: '1px solid #1C2B45', borderRadius: 16, padding: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg,#3B82F6,#14B8A6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8 }}>Expression</h1>
        <h2 style={{ fontSize: 20, color: 'rgba(255,255,255,0.92)', marginBottom: 28 }}>Welcome back</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Email</label>
            <input type="email" style={inputStyle} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Password</label>
            <input type="password" style={inputStyle} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
          </div>
          {error && <div style={{ color: '#EF4444', fontSize: 13 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ height: 48, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#3B82F6,#14B8A6)', color: 'white', fontWeight: 600, fontSize: 15 }}>
            {loading ? 'Entering…' : 'Enter the Island →'}
          </button>
        </form>
      </div>
    </div>
  )
}
