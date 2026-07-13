import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'
import Badge from '../components/ui/Badge.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import LogoutConfirmModal from '../components/ui/LogoutConfirmModal.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { updateProfile, changePassword } from '../api/auth.js'
import { getSubscription } from '../api/subscriptions.js'
import { updateOrg } from '../api/organizations.js'
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
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const { user, org, orgRole, logout, setUser } = useAuthStore()
  const isAdmin = orgRole === 'admin'
  const [tab, setTab] = useState(() => {
    const t = searchParams.get('tab')
    const role = useAuthStore.getState().orgRole
    return (t === 'plan' && role === 'admin') ? 'plan' : (t || 'profile')
  })

  const [selectedPilot, setSelectedPilot] = useState(user?.selected_avatar || null)
  const [pilotOpen, setPilotOpen] = useState(!user?.selected_avatar)
  const [displayName, setDisplayName] = useState(user?.display_name || '')
  const [saving, setSaving] = useState(false)

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false })
  const [savingPw, setSavingPw] = useState(false)

  const [showLogout, setShowLogout] = useState(false)
  const [planData, setPlanData] = useState(null)

  const [orgForm, setOrgForm] = useState({
    name:                org?.name                || '',
    description:         org?.description         || '',
    billing_name:        org?.billing_name        || '',
    billing_email:       org?.billing_email       || '',
    billing_tax_id:      org?.billing_tax_id      || '',
    billing_address:     org?.billing_address     || '',
    billing_city:        org?.billing_city        || '',
    billing_country:     org?.billing_country     || '',
    billing_postal_code: org?.billing_postal_code || '',
  })
  const [savingOrg, setSavingOrg] = useState(false)
  const { setOrg } = useAuthStore()

  useEffect(() => {
    if (isAdmin) getSubscription().then((r) => setPlanData(r.data)).catch(() => {})
  }, [isAdmin])

  const currentPlan     = planData?.plan?.name ?? org?.subscription?.plan ?? 'free'
  const maxMembers      = planData?.limits?.max_members      ?? org?.subscription?.max_members      ?? 3
  const maxStakeholders = planData?.limits?.max_stakeholders ?? org?.subscription?.max_stakeholders ?? 5
  const usedMembers      = planData?.usage?.members      ?? org?.member_count      ?? 0
  const usedStakeholders = planData?.usage?.stakeholders ?? org?.stakeholder_count ?? 0

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

  const handleSaveOrg = async () => {
    if (!org?.id) return
    setSavingOrg(true)
    try {
      const { data } = await updateOrg(org.id, orgForm)
      setOrg({ ...org, ...data }, orgRole)
      toast('Organization saved', 'success')
    } catch (e) {
      toast(e.response?.data?.message || 'Failed to save', 'error')
    } finally {
      setSavingOrg(false)
    }
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

          {/* Pilot avatar grid — collapsible when a pilot is already chosen */}
          <div style={{ marginBottom: 24 }}>
            <button
              type="button"
              onClick={() => setPilotOpen((o) => !o)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                marginBottom: pilotOpen ? 14 : 0,
              }}
            >
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)' }}>Pilot avatar</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 14, color: 'rgba(255,255,255,0.35)',
                  display: 'inline-block',
                  transform: pilotOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}>▾</span>
              </div>
            </button>
            {pilotOpen && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
                {AVATARS.map((av) => (
                  <PilotCard key={av.id} avatar={av} selected={selectedPilot === av.id} onSelect={() => handlePilotSelect(av.id)} />
                ))}
              </div>
            )}
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
            {[
              { key: 'current', label: 'Current password' },
              { key: 'next',    label: 'New password' },
              { key: 'confirm', label: 'Confirm new password' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label style={lbl}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw[key] ? 'text' : 'password'}
                    style={{ ...input, paddingRight: 42 }}
                    value={pwForm[key]}
                    onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => ({ ...s, [key]: !s[key] }))}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgba(255,255,255,0.35)', fontSize: 16, padding: 0, lineHeight: 1,
                    }}
                  >
                    {showPw[key] ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
            ))}
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
            <ProgressBar value={usedMembers} max={maxMembers} label="Members" color="#3B82F6" />
            <ProgressBar value={usedStakeholders} max={maxStakeholders} label="Stakeholders" color="#14B8A6" />
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={sectionTitle}>Organization</div>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'capitalize',
              background: isAdmin ? 'rgba(59,130,246,0.15)' : 'rgba(107,114,128,0.15)',
              color: isAdmin ? '#3B82F6' : '#9ca3af',
              border: `1px solid ${isAdmin ? 'rgba(59,130,246,0.30)' : 'rgba(107,114,128,0.30)'}`,
            }}>
              {orgRole || '—'}
            </span>
          </div>

          {isAdmin ? (
            <>
              {/* Editable org fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={lbl}>Organization name</label>
                  <input style={input} value={orgForm.name} onChange={(e) => setOrgForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label style={lbl}>Description</label>
                  <input style={input} value={orgForm.description} onChange={(e) => setOrgForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional" />
                </div>
              </div>

              {/* Billing info */}
              <div style={{ borderTop: '1px solid #1C2B45', paddingTop: 20, marginTop: 4, marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.55)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Billing Information <span style={{ fontSize: 11, fontWeight: 400, textTransform: 'none', color: 'rgba(255,255,255,0.30)' }}>— optional</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={lbl}>Legal / billing name</label>
                    <input style={input} value={orgForm.billing_name} onChange={(e) => setOrgForm((f) => ({ ...f, billing_name: e.target.value }))} placeholder="Acme Corp S.L." />
                  </div>
                  <div>
                    <label style={lbl}>Billing email</label>
                    <input style={input} type="email" value={orgForm.billing_email} onChange={(e) => setOrgForm((f) => ({ ...f, billing_email: e.target.value }))} placeholder="billing@company.com" />
                  </div>
                  <div>
                    <label style={lbl}>Tax / VAT ID</label>
                    <input style={input} value={orgForm.billing_tax_id} onChange={(e) => setOrgForm((f) => ({ ...f, billing_tax_id: e.target.value }))} placeholder="ESB12345678" />
                  </div>
                  <div>
                    <label style={lbl}>Address</label>
                    <input style={input} value={orgForm.billing_address} onChange={(e) => setOrgForm((f) => ({ ...f, billing_address: e.target.value }))} placeholder="Calle Mayor 1" />
                  </div>
                  <div>
                    <label style={lbl}>City</label>
                    <input style={input} value={orgForm.billing_city} onChange={(e) => setOrgForm((f) => ({ ...f, billing_city: e.target.value }))} placeholder="Barcelona" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={lbl}>Postal code</label>
                      <input style={input} value={orgForm.billing_postal_code} onChange={(e) => setOrgForm((f) => ({ ...f, billing_postal_code: e.target.value }))} placeholder="08001" />
                    </div>
                    <div>
                      <label style={lbl}>Country</label>
                      <input style={input} value={orgForm.billing_country} onChange={(e) => setOrgForm((f) => ({ ...f, billing_country: e.target.value }))} placeholder="Spain" />
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={handleSaveOrg} disabled={savingOrg} style={{
                padding: '10px 28px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#3B82F6,#14B8A6)',
                color: 'white', fontWeight: 600, fontSize: 14, opacity: savingOrg ? 0.6 : 1,
              }}>
                {savingOrg ? 'Saving…' : 'Save organization'}
              </button>
            </>
          ) : (
            // Non-admin: read-only display
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
            </div>
          )}
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
