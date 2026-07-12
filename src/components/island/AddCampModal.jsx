import { useState, useEffect } from 'react'
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

const CATEGORIES = ['Cliente', 'Proveedor', 'Partner', 'Regulador', 'Interno', 'Otro']

const FLAG_EMOJIS = [
  '🏕️','⛺','🚩','🔥','🏔️','🌴','🏖️','⚡','🌋','🏴',
  '🎯','💎','⭐','🏰','🌺','🛡️','🦅','🗺️','🎪','🌊',
  '🐉','🧭','⚓','🔭','🏹','🌀','💫','🎖️','🏆','🌐',
]

const ZONE_COLORS = {
  forest: '#166534', mountain: '#374151', beach: '#FCD34D', jungle: '#065F46',
  desert: '#D97706', river: '#1D4ED8', lake: '#0EA5E9', coast: '#BAE6FD', volcano: '#991B1B',
}

export default function AddCampModal({ open, onClose, defaultZone, defaultPosition }) {
  const toast = useToast()
  const addStakeholder = useIslandStore((s) => s.addStakeholder)
  const [form, setForm] = useState({
    name: '', description: '', category: 'Cliente', zone: 'forest',
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
      setForm({ name: '', description: '', category: 'Cliente', zone: 'forest', position_x: 50, position_y: 50, emoji: '🏕️' })
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

  return (
    <Modal open={open} onClose={onClose} title="Plant your flag 🚩">
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
            Camp flag  <span style={{ fontSize: 18 }}>{form.emoji}</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {FLAG_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => set('emoji', e)}
                style={{
                  width: 38, height: 38, borderRadius: 8, border: `2px solid ${form.emoji === e ? '#3B82F6' : 'rgba(255,255,255,0.10)'}`,
                  background: form.emoji === e ? 'rgba(59,130,246,0.15)' : 'rgba(11,17,32,0.6)',
                  fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'border-color 0.15s',
                }}
              >
                {e}
              </button>
            ))}
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
