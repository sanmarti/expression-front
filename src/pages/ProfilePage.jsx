import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'
import Badge from '../components/ui/Badge.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import LogoutConfirmModal from '../components/ui/LogoutConfirmModal.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { updateProfile, changePassword } from '../api/auth.js'
import { AVATARS, getAvatar } from '../constants/avatars.js'

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'plan',    label: 'Plan & Billing' },
  { id: 'account', label: 'Account' },
]

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

const card = {
  background: '#141E35', border: '1px solid #1C2B45', borderRadius: 14, padding: 28, marginBottom: 20,
}
const lbl = { fontSize: 13, color: 'rgba(255,255,255,0.50)', display: 'block', marginBottom: 6 }
const input = {
  width: '100%', padding: '11px 14px', borderRadius: 8, boxSizing: 'border-box',
  background: '#0B1120', border: '1px solid #1C2B45',
  color: 'rgba(255,255,255,0.92)', fontSize: 14, outline: 'none',
}
const sectionTitle = { fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.92)', marginBottom: 20 }

export default function ProfilePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, org, orgRole, logout, setUser } = useAuthStore()
  const isAdmin = orgRole === 'admin'
  const [tab, setTab] = useState('profile')

  const [selectedPilot, setSelectedPilot] = useState(user?.selected_avatar || null)
  const [displayName, setDisplayName] = useState(user?.display_name || '')
  const [saving, setSaving] = useState(false)

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)

  const [showLogout, setShowLogout] = useState(false)

  const currentPlan = org?.subscription?.plan || 'free'
  const maxMembers = org?.subscription?.max_members || 3
  const maxStakeholders = org?.subscription?.max_stakeholders || 5

  // Live preview: the currently selected pilot avatar
  const previewAvatar = getAvatar(selectedPilot)
  const [imgSrc, setImgSrc] = useState(previewAvatar?.src)

  const handlePilotSelect = (id) => {
    setSelectedPilot(id)
    const av = getAvatar(id)
    setImgSrc(av?.src)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {}
      if (displayName !== user?.display_name) payload.display_name = displayName
      if (selectedPilot !== user?.selected_avatar) payload.selected_avatar = selectedPilot
      if (Object.keys(payload).length === 0) { toast('Nothing changed', 'info'); return }
      const { data } = await updateProfile(payload)
      setUser({ ...user, ...data, selected_avatar: selectedPilot, display_name: displayName })
      toast('Profile saved', 'success')
    } catch (e) {
      toast(e.response?.data?.message || 'Failed to save', 'error')
    } finally {
      setSaving(false)
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
        <button onClick={() => navigate('/island')} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: 14, padding: '0 0 28px 0' }}>
          ← Back to Island
        </button>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #1C2B45', marginBottom: 28 }}>
          {TABS.filter((t) => t.id !== 'plan' || isAdmin).map((t) => {
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '10px 22px', background: 'none', border: 'none',
                borderBottom: `2px solid ${active ? '#3B82F6' : 'transparent'}`,
                color: active ? '#3B82F6' : 'rgba(255,255,255,0.45)',
                fontWeight: active ? 700 : 400, fontSize: 14, cursor: 'pointer',
                marginBottom: -1, transition: 'all 0.15s',
              }}>
                {t.label}
              </button>
            )
          })}
        </div>

        {tab === 'profile' && <>

        {/* ── Profile card ── */}
        <div style={card}>
          <div style={sectionTitle}>Your Profile</div>

          {/* Profile picture (= selected pilot avatar) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <div style={{
              width: 160, height: 160, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
              border: `4px solid ${previewAvatar ? '#3B82F6' : '#1C2B45'}`,
              background: '#0B1120',
              transition: 'border-color 0.2s',
              boxShadow: previewAvatar ? '0 0 32px rgba(59,130,246,0.40)' : 'none',
            }}>
              {previewAvatar ? (
                <img
                  src={imgSrc}
                  onError={() => setImgSrc(previewAvatar.placeholder)}
                  alt={displayName || user?.display_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 20%', display: 'block' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: 'rgba(255,255,255,0.20)' }}>✈</div>
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.92)', marginBottom: 4 }}>
                {displayName || user?.display_name}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)' }}>{user?.email}</div>
            </div>
          </div>

          {/* Name + Email fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
            <div>
              <label style={lbl}>Display name</label>
              <input style={input} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Email</label>
              <input style={{ ...input, opacity: 0.5, cursor: 'not-allowed' }} value={user?.email || ''} readOnly />
            </div>
          </div>

          {/* Pilot avatar grid */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', marginBottom: 14 }}>Select your avatar</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
              {AVATARS.map((av) => (
                <PilotCard key={av.id} avatar={av} selected={selectedPilot === av.id} onSelect={() => handlePilotSelect(av.id)} />
              ))}
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} style={{
            padding: '10px 28px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#3B82F6,#14B8A6)',
            color: 'white', fontWeight: 600, fontSize: 14, opacity: saving ? 0.6 : 1,
          }}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>

        {/* ── Change Password ── */}
        <div style={card}>
          <div style={sectionTitle}>Change Password</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
            <div>
              <label style={lbl}>Current password</label>
              <input type="password" style={input} value={pwForm.current}
                onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>New password</label>
              <input type="password" style={input} value={pwForm.next}
                onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Confirm new password</label>
              <input type="password" style={input} value={pwForm.confirm}
                onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} />
            </div>
            <button onClick={handleChangePassword} disabled={savingPw} style={{
              alignSelf: 'flex-start', padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: '#1C2B45', color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: 14,
              opacity: savingPw ? 0.6 : 1,
            }}>
              {savingPw ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </div>

        </> /* end profile tab */}

        {tab === 'plan' && <>

        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={sectionTitle}>Current Plan</div>
            <Badge variant="teal" style={{ textTransform: 'capitalize', marginBottom: 20 }}>{currentPlan}</Badge>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ProgressBar value={org?.member_count || 0} max={maxMembers} label="Members" color="#3B82F6" />
            <ProgressBar value={org?.stakeholder_count || 0} max={maxStakeholders} label="Stakeholders" color="#14B8A6" />
          </div>
        </div>

        <div style={card}>
          <div style={sectionTitle}>Available Plans</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {PLANS.map((plan) => {
              const isCurrent = plan.id === currentPlan
              const isUpgrade = PLANS.findIndex((p) => p.id === plan.id) > PLANS.findIndex((p) => p.id === currentPlan)
              return (
                <div key={plan.id} style={{
                  background: isCurrent ? '#1C2B45' : '#0B1120',
                  border: `1px solid ${isCurrent ? '#10B981' : '#1C2B45'}`,
                  borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 10,
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
                  <button onClick={() => handleUpgradePlan(plan.id)} disabled={isCurrent} style={{
                    padding: '8px', borderRadius: 7, border: 'none', cursor: isCurrent ? 'default' : 'pointer',
                    background: isCurrent ? 'rgba(16,185,129,0.15)' : isUpgrade ? '#3B82F6' : '#374151',
                    color: isCurrent ? '#10B981' : 'white', fontWeight: 600, fontSize: 12,
                  }}>
                    {isCurrent ? 'Current' : isUpgrade ? 'Upgrade' : 'Downgrade'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        </> /* end plan tab */}

        {tab === 'account' && <>

        <div style={card}>
          <div style={sectionTitle}>Organization</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { label: 'Name',  value: org?.name },
              { label: 'Email', value: user?.email },
            ].map(({ label: l, value }) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', width: 80, flexShrink: 0 }}>{l}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{value || '—'}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', width: 80, flexShrink: 0 }}>Role</span>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'capitalize',
                background: isAdmin ? 'rgba(59,130,246,0.15)' : 'rgba(107,114,128,0.15)',
                color: isAdmin ? '#3B82F6' : '#9ca3af',
                border: `1px solid ${isAdmin ? 'rgba(59,130,246,0.30)' : 'rgba(107,114,128,0.30)'}`,
              }}>
                {orgRole || '—'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ ...card, border: '1px solid rgba(239,68,68,0.20)', marginBottom: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>Danger Zone</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>These actions cannot be undone.</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 3 }}>Log out</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>End your session and return to the landing page.</div>
            </div>
            <button onClick={() => setShowLogout(true)} style={{
              padding: '9px 22px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.40)',
              background: 'transparent', color: '#EF4444', cursor: 'pointer', fontWeight: 600, fontSize: 14,
            }}>
              Log out
            </button>
          </div>
        </div>

        </> /* end account tab */}
      </div>
    </div>
  )
}

function PilotCard({ avatar, selected, onSelect }) {
  const [imgSrc, setImgSrc] = useState(avatar.src)
  return (
    <button
      onClick={onSelect}
      style={{
        background: selected ? 'rgba(59,130,246,0.15)' : '#0B1120',
        border: `2px solid ${selected ? '#3B82F6' : '#1C2B45'}`,
        borderRadius: 12, padding: '6px 4px',
        cursor: 'pointer',
        transform: selected ? 'scale(1.06)' : 'scale(1)',
        boxShadow: selected ? '0 0 20px rgba(59,130,246,0.45)' : 'none',
        transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{
        width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
        border: `2px solid ${selected ? '#3B82F6' : 'rgba(255,255,255,0.06)'}`,
        transition: 'border-color 0.15s',
      }}>
        <img
          src={imgSrc}
          onError={() => setImgSrc(avatar.placeholder)}
          alt={avatar.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 20%', display: 'block' }}
        />
      </div>
    </button>
  )
}
