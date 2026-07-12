import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { acceptInvite } from '../api/members.js'
import { register } from '../api/auth.js'
import useAuthStore from '../store/authStore.js'
import Spinner from '../components/ui/Spinner.jsx'

export default function AcceptInvitePage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { login, setOrg } = useAuthStore()
  const [state, setState] = useState('loading') // loading | register | success | error
  const [inviteData, setInviteData] = useState(null)
  const [form, setForm] = useState({ display_name: '', email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    acceptInvite(token)
      .then(({ data }) => {
        if (data.needsRegistration) {
          setInviteData(data)
          setForm((f) => ({ ...f, email: data.email || '' }))
          setState('register')
        } else {
          setInviteData(data)
          if (data.token) login(data.token, data.user)
          if (data.org) setOrg(data.org, data.orgRole)
          setState('success')
        }
      })
      .catch(() => setState('error'))
  }, [token])

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 8, marginTop: 6,
    background: '#0B1120', border: '1px solid #1C2B45',
    color: 'rgba(255,255,255,0.92)', fontSize: 14, outline: 'none', display: 'block',
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await register(form.display_name, form.email, form.password)
      login(data.token, data.user)
      // accept again now that we have an account
      const accept = await acceptInvite(token)
      if (accept.data.org) setOrg(accept.data.org, accept.data.orgRole)
      navigate('/island')
    } catch (err) {
      setErrMsg(err.response?.data?.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#141E35', border: '1px solid #1C2B45', borderRadius: 16, padding: 40, textAlign: 'center' }}>
        {state === 'loading' && <Spinner size={48} />}

        {state === 'error' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
            <h2 style={{ fontSize: 22, color: 'rgba(255,255,255,0.92)', marginBottom: 8 }}>Invitation invalid</h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 24 }}>
              This invitation has expired or is invalid.
            </p>
            <button onClick={() => navigate('/')} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#3B82F6', color: 'white', fontWeight: 600 }}>
              Go to home
            </button>
          </>
        )}

        {state === 'success' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, color: 'rgba(255,255,255,0.92)', marginBottom: 8 }}>
              Welcome to {inviteData?.org?.name || 'the island'}!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 24 }}>You're now part of the team.</p>
            <button onClick={() => navigate('/island')} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#3B82F6,#14B8A6)', color: 'white', fontWeight: 600 }}>
              Enter the Island
            </button>
          </>
        )}

        {state === 'register' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏝️</div>
            <h2 style={{ fontSize: 22, color: 'rgba(255,255,255,0.92)', marginBottom: 4 }}>You've been invited!</h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 24, fontSize: 14 }}>
              Join {inviteData?.org?.name || 'the team'} on Expression
            </p>
            <form onSubmit={handleRegister} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Your name</label>
                <input style={inputStyle} value={form.display_name} onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Email</label>
                <input type="email" style={inputStyle} value={form.email} readOnly />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Password</label>
                <input type="password" style={inputStyle} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required minLength={8} />
              </div>
              {errMsg && <div style={{ color: '#EF4444', fontSize: 13 }}>{errMsg}</div>}
              <button type="submit" disabled={submitting} style={{ height: 44, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#3B82F6,#14B8A6)', color: 'white', fontWeight: 600 }}>
                {submitting ? 'Joining…' : 'Join & Enter Island 🚩'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
