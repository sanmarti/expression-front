import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'
import Avatar from '../components/ui/Avatar.jsx'
import Badge from '../components/ui/Badge.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import LogoutConfirmModal from '../components/ui/LogoutConfirmModal.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { updateProfile, changePassword } from '../api/auth.js'

const PLANS = [
  { id: 'free',       label: 'Free',       price: '$0',   members: 3,    stakeholders: 5,
    features: ['3 team members', '5 stakeholders', 'Basic climate tracking', 'Island map'] },
  { id: 'starter',    label: 'Starter',    price: '$29',  members: 10,   stakeholders: 20,
    features: ['10 team members', '20 stakeholders', 'Full climate system', 'History & trends', 'Email invites'] },
  { id: 'pro',        label: 'Pro',        price: '$99',  members: 50,   stakeholders: 100,
    features: ['50 team members', '100 stakeholders', 'API integrations', 'Advanced analytics', 'Priority support'] },
  { id: 'enterprise', label: 'Enterprise', price: '$299', members: '∞',  stakeholders: '∞',
    features: ['Unlimited members', 'Unlimited stakeholders', 'SSO', 'Custom integrations', 'Dedicated support'] },
]

function resizeToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const SIZE = 256
        const canvas = document.createElement('canvas')
        canvas.width = SIZE
        canvas.height = SIZE
        const ctx = canvas.getContext('2d')
        const min = Math.min(img.width, img.height)
        const sx = (img.width - min) / 2
        const sy = (img.height - min) / 2
        ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

const card = {
  background: '#141E35', border: '1px solid #1C2B45', borderRadius: 14, padding: 28, marginBottom: 20,
}
const label = { fontSize: 13, color: 'rgba(255,255,255,0.50)', display: 'block', marginBottom: 6 }
const input = {
  width: '100%', padding: '11px 14px', borderRadius: 8, boxSizing: 'border-box',
  background: '#0B1120', border: '1px solid #1C2B45',
  color: 'rgba(255,255,255,0.92)', fontSize: 14, outline: 'none',
}
const sectionTitle = { fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.92)', marginBottom: 20 }

export default function ProfilePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, org, logout, setUser } = useAuthStore()
  const fileRef = useRef(null)

  const [displayName, setDisplayName] = useState(user?.display_name || '')
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null)
  const [avatarData, setAvatarData] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)

  const [showLogout, setShowLogout] = useState(false)

  const currentPlan = org?.subscription?.plan || 'free'
  const maxMembers = org?.subscription?.max_members || 3
  const maxStakeholders = org?.subscription?.max_stakeholders || 5

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const b64 = await resizeToBase64(file)
    setAvatarPreview(b64)
    setAvatarData(b64)
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const payload = {}
      if (displayName !== user?.display_name) payload.display_name = displayName
      if (avatarData) payload.avatar_url = avatarData
      if (Object.keys(payload).length === 0) { toast('Nothing changed', 'info'); return }
      const { data } = await updateProfile(payload)
      setUser(data)
      toast('Profile updated', 'success')
    } catch (e) {
      toast(e.response?.data?.message || 'Failed to save', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (pwForm.next !== pwForm.confirm) { toast('Passwords do not match', 'error'); return }
    if (pwForm.next.length < 8) { toast('Password must be at least 8 characters', 'error'); return }
    setSavingPw(true)
    try {
      await changePassword(pwForm.current, pwForm.next)
      toast('Password updated', 'success')
      setPwForm({ current: '', next: '', confirm: '' })
    } catch (e) {
      toast(e.response?.data?.message || 'Failed to update password', 'error')
    } finally {
      setSavingPw(false)
    }
  }

  const handleUpgradePlan = (planId) => {
    if (planId === currentPlan) return
    const cur = PLANS.findIndex((p) => p.id === currentPlan)
    const tgt = PLANS.findIndex((p) => p.id === planId)
    if (tgt > cur) toast('Upgrade coming soon!', 'info')
    else toast('Contact us to downgrade: hello@expression.app', 'info')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', padding: '32px 24px' }}>
      {showLogout && <LogoutConfirmModal onConfirm={logout} onCancel={() => setShowLogout(false)} />}

      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <button onClick={() => navigate('/island')} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: 14, padding: '0 0 24px 0' }}>
          ← Back to Island
        </button>

        {/* ── Profile ── */}
        <div style={card}>
          <div style={sectionTitle}>Your Profile</div>

          {/* Avatar upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
              <Avatar name={user?.display_name || user?.email || '?'} size={80} src={avatarPreview} />
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 24, height: 24, borderRadius: '50%', background: '#3B82F6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, color: 'white', border: '2px solid #141E35',
              }}>
                +
              </div>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>
                {user?.display_name}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>
                {user?.email}
              </div>
              <button onClick={() => fileRef.current?.click()} style={{
                fontSize: 12, color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}>
                Change photo
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={label}>Display name</label>
              <input style={input} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div>
              <label style={label}>Email</label>
              <input style={{ ...input, opacity: 0.5, cursor: 'not-allowed' }} value={user?.email || ''} readOnly />
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            style={{
              padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#3B82F6,#14B8A6)',
              color: 'white', fontWeight: 600, fontSize: 14, opacity: savingProfile ? 0.6 : 1,
            }}
          >
            {savingProfile ? 'Saving…' : 'Save changes'}
          </button>
        </div>

        {/* ── Change Password ── */}
        <div style={card}>
          <div style={sectionTitle}>Change Password</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
            <div>
              <label style={label}>Current password</label>
              <input type="password" style={input} value={pwForm.current}
                onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))} />
            </div>
            <div>
              <label style={label}>New password</label>
              <input type="password" style={input} value={pwForm.next}
                onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))} />
            </div>
            <div>
              <label style={label}>Confirm new password</label>
              <input type="password" style={input} value={pwForm.confirm}
                onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={savingPw}
              style={{
                alignSelf: 'flex-start', padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: '#1C2B45', color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: 14,
                opacity: savingPw ? 0.6 : 1,
              }}
            >
              {savingPw ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </div>

        {/* ── Your Plan ── */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={sectionTitle}>Your Plan</div>
            <Badge variant="teal" style={{ textTransform: 'capitalize', marginBottom: 20 }}>{currentPlan}</Badge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            <ProgressBar value={org?.member_count || 0} max={maxMembers} label="Members" color="#3B82F6" />
            <ProgressBar value={org?.stakeholder_count || 0} max={maxStakeholders} label="Stakeholders" color="#14B8A6" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {PLANS.map((plan) => {
              const isCurrent = plan.id === currentPlan
              const isUpgrade = PLANS.findIndex((p) => p.id === plan.id) > PLANS.findIndex((p) => p.id === currentPlan)
              return (
                <div key={plan.id} style={{
                  background: isCurrent ? '#1C2B45' : '#0B1120',
                  border: `1px solid ${isCurrent ? '#10B981' : '#1C2B45'}`,
                  borderRadius: 12, padding: 18,
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>{plan.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#3B82F6' }}>
                    {plan.price}<span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>/mo</span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {plan.features.map((f) => (
                      <div key={f} style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', display: 'flex', gap: 5 }}>
                        <span style={{ color: '#10B981' }}>✓</span>{f}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleUpgradePlan(plan.id)}
                    disabled={isCurrent}
                    style={{
                      padding: '8px', borderRadius: 7, border: 'none', cursor: isCurrent ? 'default' : 'pointer',
                      background: isCurrent ? 'rgba(16,185,129,0.15)' : isUpgrade ? '#3B82F6' : '#374151',
                      color: isCurrent ? '#10B981' : 'white', fontWeight: 600, fontSize: 12,
                    }}
                  >
                    {isCurrent ? 'Current' : isUpgrade ? 'Upgrade' : 'Downgrade'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Log out ── */}
        <div style={{ ...card, marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.92)', marginBottom: 4 }}>Log out</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)' }}>You will be returned to the landing page.</div>
            </div>
            <button
              onClick={() => setShowLogout(true)}
              style={{
                padding: '10px 24px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.35)',
                background: 'transparent', color: '#EF4444', cursor: 'pointer', fontWeight: 600, fontSize: 14,
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
