import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'
import { updateProfile } from '../api/auth.js'
import { useToast } from '../components/ui/Toast.jsx'
import { AVATARS } from '../constants/avatars.js'

export default function ChoosePilotPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, org, setUser } = useAuthStore()
  const [selected, setSelected] = useState(user?.selected_avatar || null)
  const [saving, setSaving] = useState(false)

  const handleContinue = async () => {
    if (!selected) { toast('Pick a pilot first', 'error'); return }
    setSaving(true)
    try {
      const { data } = await updateProfile({ selected_avatar: selected })
      setUser({ ...user, selected_avatar: selected, ...data })
      if (user?.role === 'superadmin') navigate('/admin')
      else if (org) navigate('/island')
      else navigate('/create-org')
    } catch {
      toast('Failed to save pilot', 'error')
    } finally {
      setSaving(false)
    }
  }

  const selectedAvatar = AVATARS.find((a) => a.id === selected)

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: 900, width: '100%' }}>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40, justifyContent: 'center' }}>
          <StepDot done label="Account" />
          <div style={{ width: 48, height: 2, background: '#3B82F6', borderRadius: 2 }} />
          <StepDot active num="2" label="Pilot" />
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 800, color: 'rgba(255,255,255,0.92)', textAlign: 'center', margin: '0 0 10px' }}>
          Choose your pilot
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.40)', textAlign: 'center', margin: '0 0 36px', fontSize: 15 }}>
          Your pilot lives on the island and guides your cockpit
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 36 }}>
          {AVATARS.map((av) => (
            <AvatarCard key={av.id} avatar={av} selected={selected === av.id} onSelect={() => setSelected(av.id)} />
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || saving}
          style={{
            display: 'block', width: '100%', height: 54, borderRadius: 12, border: 'none',
            background: selected ? 'linear-gradient(135deg,#3B82F6,#14B8A6)' : '#1C2B45',
            color: selected ? 'white' : 'rgba(255,255,255,0.25)',
            fontSize: 16, fontWeight: 700, cursor: selected ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s', letterSpacing: '0.01em',
          }}
        >
          {saving ? 'Saving…' : selected ? `Fly as ${user?.display_name || user?.email} →` : 'Select a pilot to continue'}
        </button>
      </div>
    </div>
  )
}

function StepDot({ done, active, num, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 30, height: 30, borderRadius: '50%',
        background: done ? 'rgba(59,130,246,0.15)' : active ? '#3B82F6' : '#1C2B45',
        border: `2px solid ${done || active ? '#3B82F6' : '#1C2B45'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700,
        color: done ? '#3B82F6' : active ? 'white' : 'rgba(255,255,255,0.30)',
      }}>
        {done ? '✓' : num}
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: done || active ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.30)' }}>
        {label}
      </span>
    </div>
  )
}

function AvatarCard({ avatar, selected, onSelect }) {
  const [imgSrc, setImgSrc] = useState(avatar.src)

  return (
    <button
      onClick={onSelect}
      style={{
        background: selected ? `${avatar.color}18` : '#141E35',
        border: `2px solid ${selected ? avatar.color : '#1C2B45'}`,
        borderRadius: 16, padding: 12,
        cursor: 'pointer',
        transition: 'all 0.15s',
        transform: selected ? 'scale(1.05)' : 'scale(1)',
        boxShadow: selected ? `0 0 28px ${avatar.color}50` : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{
        width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
        border: `3px solid ${selected ? avatar.color : 'rgba(255,255,255,0.08)'}`,
        transition: 'border-color 0.15s',
      }}>
        <img
          src={imgSrc}
          onError={() => setImgSrc(avatar.placeholder)}
          alt={avatar.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
        />
      </div>
    </button>
  )
}
