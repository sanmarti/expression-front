import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'
import Avatar from '../components/ui/Avatar.jsx'
import { useToast } from '../components/ui/Toast.jsx'

export default function ProfilePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, logout } = useAuthStore()
  const [form, setForm] = useState({ display_name: user?.display_name || '', email: user?.email || '' })

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 8, marginTop: 6,
    background: '#0B1120', border: '1px solid #1C2B45',
    color: 'rgba(255,255,255,0.92)', fontSize: 14, outline: 'none', display: 'block',
  }

  const handleSave = (e) => {
    e.preventDefault()
    toast('Profile update coming soon', 'info')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <button onClick={() => navigate('/island')} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: 14, padding: '0 0 20px 0' }}>
          ← Back to Island
        </button>

        <div style={{ background: '#141E35', border: '1px solid #1C2B45', borderRadius: 16, padding: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <Avatar name={user?.display_name || user?.email || '?'} size={56} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>{user?.display_name}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{user?.email}</div>
            </div>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Display name</label>
              <input style={inputStyle} value={form.display_name} onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Email</label>
              <input type="email" style={inputStyle} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" style={{
                flex: 1, height: 44, borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#3B82F6,#14B8A6)', color: 'white', fontWeight: 600,
              }}>
                Save changes
              </button>
              <button type="button" onClick={logout} style={{
                height: 44, padding: '0 20px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)',
                background: 'transparent', color: '#EF4444', cursor: 'pointer', fontWeight: 600,
              }}>
                Log out
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
