import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, register as apiRegister } from '../../api/auth.js'
import { getMe } from '../../api/auth.js'
import useAuthStore from '../../store/authStore.js'

export default function AuthPanel() {
  const navigate = useNavigate()
  const { login, setOrg } = useAuthStore()
  const [tab, setTab] = useState('signin')
  const [form, setForm] = useState({ display_name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 8, marginTop: 6,
    background: 'rgba(11,17,32,0.70)', border: '1px solid rgba(255,255,255,0.10)',
    color: 'rgba(255,255,255,0.92)', fontSize: 14, outline: 'none',
    display: 'block',
  }
  const labelStyle = { fontSize: 13, color: 'rgba(255,255,255,0.55)', display: 'block' }

  const handleSignIn = async (e) => {
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

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await apiRegister(form.display_name, form.email, form.password)
      login(data.token, data.user)
      navigate('/choose-pilot')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const tabBtn = (id, label) => (
    <button
      type="button"
      onClick={() => { setTab(id); setError('') }}
      style={{
        flex: 1, padding: '10px 0', border: 'none', background: 'transparent',
        cursor: 'pointer', fontSize: 15, fontWeight: 600,
        color: tab === id ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.40)',
        borderBottom: `2px solid ${tab === id ? '#3B82F6' : 'transparent'}`,
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{
      width: '100%', maxWidth: 420,
      background: 'rgba(10,15,30,0.78)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 20,
      boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
      padding: '44px 36px',
      display: 'flex', flexDirection: 'column',
    }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: 'rgba(255,255,255,0.92)', marginBottom: 24, marginTop: 0 }}>
        {tab === 'signin' ? 'Welcome back' : 'Get started'}
      </h2>

      <div style={{ display: 'flex', borderBottom: '1px solid #1C2B45', marginBottom: 28 }}>
        {tabBtn('signin', 'Sign In')}
        {tabBtn('signup', 'Sign Up')}
      </div>

      {tab === 'signin' ? (
        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" style={inputStyle} value={form.email} onChange={(e) => set('email', e.target.value)} required />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input type="password" style={inputStyle} value={form.password} onChange={(e) => set('password', e.target.value)} required />
          </div>
          {error && <div style={{ color: '#EF4444', fontSize: 13 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{
            width: '100%', height: 48, borderRadius: 8, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: 'linear-gradient(135deg, #3B82F6, #14B8A6)',
            color: 'white', fontSize: 15, fontWeight: 600, opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Entering…' : 'Enter the Island →'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>Your name</label>
            <input style={inputStyle} value={form.display_name} onChange={(e) => set('display_name', e.target.value)} required />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" style={inputStyle} value={form.email} onChange={(e) => set('email', e.target.value)} required />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input type="password" style={inputStyle} value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={8} />
          </div>
          {error && <div style={{ color: '#EF4444', fontSize: 13 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{
            width: '100%', height: 48, borderRadius: 8, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: 'linear-gradient(135deg, #3B82F6, #14B8A6)',
            color: 'white', fontSize: 15, fontWeight: 600, opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Creating…' : 'Start Exploring →'}
          </button>
        </form>
      )}
    </div>
  )
}
