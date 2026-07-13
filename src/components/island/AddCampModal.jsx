import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../ui/Modal.jsx'
import { createStakeholder } from '../../api/stakeholders.js'
import useIslandStore from '../../store/islandStore.js'
import { useToast } from '../ui/Toast.jsx'

const ZONES = [
  { id: 'forest', label: '🌲 Forest' },
  { id: 'mountain', label: '⛰️ Mountain' },
  { id: 'beach', label: '🏖️ Beach' },
  { id: 'jungle', label: '🌴 Jungle' },
  { id: 'desert', label: '🏜️ Desert' },
  { id: 'river', label: '🌊 River' },
  { id: 'lake', label: '💧 Lake' },
  { id: 'coast', label: '🌊 Coast' },
  { id: 'volcano', label: '🌋 Volcano' },
]

const CATEGORIES = ['Client', 'Supplier', 'Partner', 'Regulator', 'Internal', 'Other']

const CAMP_EMOJIS = [
  { em: '🏕️', label: 'Bush Camp' },
  { em: '⛺',  label: 'Base Camp' },
  { em: '🛖',  label: 'Shelter' },
  { em: '🏠',  label: 'House' },
  { em: '🏡',  label: 'Homestead' },
  { em: '🏘️', label: 'Settlement' },
]

const ZONE_COLORS = {
  forest: '#166534', mountain: '#374151', beach: '#FCD34D', jungle: '#065F46',
  desert: '#D97706', river: '#1D4ED8', lake: '#0EA5E9', coast: '#BAE6FD', volcano: '#991B1B',
}

export default function AddCampModal({ open, onClose, defaultZone, defaultPosition, limitReached, maxStakeholders, stakeholderCount, orgRole }) {
  const navigate = useNavigate()
  const toast = useToast()
  const addStakeholder = useIslandStore((s) => s.addStakeholder)
  const [form, setForm] = useState({
    name: '', description: '', category: 'Client', zone: 'forest',
    position_x: 50, position_y: 50, emoji: '🏕️',
  })
  const [loading, setLoading] = useState(false)

  // Sync zone and position each time the modal opens
  useEffect(() => {
    if (open) {
      setForm((f) => ({
        ...f,
        zone: defaultZone || 'forest',
        position_x: defaultPosition?.x ?? 50,
        position_y: defaultPosition?.y ?? 50,
      }))
    }
  }, [open, defaultZone, defaultPosition])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await createStakeholder(form)
      // merge position from form in case the API doesn't echo it back
      addStakeholder({
        ...data,
        position_x: data.position_x ?? form.position_x,
        position_y: data.position_y ?? form.position_y,
      })
      toast('Camp planted! 🚩', 'success')
      onClose()
      setForm({ name: '', description: '', category: 'Client', zone: 'forest', position_x: 50, position_y: 50, emoji: '🏕️' })
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to create camp', 'error')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    background: '#0B1120', border: '1px solid #1C2B45',
    color: 'rgba(255,255,255,0.92)', fontSize: 14, outline: 'none',
  }

  if (limitReached) {
    const isAdmin = orgRole === 'admin'
    return (
      <Modal open={open} onClose={onClose} title="Stakeholder limit reached">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '8px 0 4px', textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>{isAdmin ? '🚀' : '🔒'}</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.92)', marginBottom: 8 }}>
              {isAdmin ? 'You\'ve reached your stakeholder limit' : 'Stakeholder limit reached'}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6 }}>
              {isAdmin
                ? `Your plan allows up to ${maxStakeholders} stakeholders (${stakeholderCount}/${maxStakeholders} used). Upgrade your plan to add more.`
                : `Your organization has used all ${maxStakeholders} stakeholder slots. Ask your admin to upgrade the plan.`
              }
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onClose}
              style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #1C2B45', background: 'transparent', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', fontSize: 14 }}
            >
              Close
            </button>
            {isAdmin && (
              <button
                onClick={() => { onClose(); navigate('/profile?tab=plan') }}
                style={{ padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#3B82F6,#14B8A6)', color: 'white', fontWeight: 600, fontSize: 14 }}
              >
                Upgrade plan →
              </button>
            )}
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="Create new stakeholder">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
            Camp name *
          </label>
          <input
            style={inputStyle}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            placeholder="e.g. Acme Corp"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
            Description
          </label>
          <textarea
            style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Brief description..."
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
              Category
            </label>
            <select style={inputStyle} value={form.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
              Zone
            </label>
            <select style={inputStyle} value={form.zone} onChange={(e) => set('zone', e.target.value)}>
              {ZONES.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}
            </select>
          </div>
        </div>
        {/* Emoji picker */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
            Camp type
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CAMP_EMOJIS.map(({ em, label }) => {
              const selected = form.emoji === em
              return (
                <button
                  key={em}
                  type="button"
                  onClick={() => set('emoji', em)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                    background: selected ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${selected ? '#3B82F6' : 'rgba(255,255,255,0.10)'}`,
                    boxShadow: selected ? '0 0 12px rgba(59,130,246,0.25)' : 'none',
                    transition: 'all 0.12s',
                  }}
                >
                  <span style={{ fontSize: 26, lineHeight: 1 }}>{em}</span>
                  <span style={{ fontSize: 10, color: selected ? '#3B82F6' : 'rgba(255,255,255,0.40)', fontFamily: 'monospace', fontWeight: selected ? 700 : 400, letterSpacing: '0.04em' }}>
                    {label.toUpperCase()}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* zone preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
          <div style={{
            width: 14, height: 14, borderRadius: '50%',
            background: ZONE_COLORS[form.zone] || '#3B82F6',
            border: '2px solid rgba(255,255,255,0.2)',
          }} />
          Zone: {ZONES.find((z) => z.id === form.zone)?.label}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px', borderRadius: 8, border: '1px solid #1C2B45',
              background: 'transparent', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', fontSize: 14,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #3B82F6, #14B8A6)',
              color: 'white', fontWeight: 600, fontSize: 14, opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Planting…' : 'Plant the Flag 🚩'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
