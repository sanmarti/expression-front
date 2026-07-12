import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import WeatherEffect from '../island/WeatherEffect.jsx'
import { updateClimate } from '../../api/climate.js'
import useIslandStore from '../../store/islandStore.js'
import { useToast } from '../ui/Toast.jsx'

const WEATHER_TYPES = ['sunny','cloudy','rainy','stormy','foggy','windy','snowy','clear']
const SENTIMENTS = [
  { value: 'positive', label: '😊 Positive', color: '#10B981' },
  { value: 'neutral', label: '😐 Neutral', color: '#6B7280' },
  { value: 'mixed', label: '😕 Mixed', color: '#F59E0B' },
  { value: 'negative', label: '😞 Negative', color: '#EF4444' },
  { value: 'unknown', label: '❓ Unknown', color: '#6B7280' },
]
const TRENDS = [
  { value: 'up', label: '↑ Improving' },
  { value: 'stable', label: '→ Stable' },
  { value: 'down', label: '↓ Declining' },
  { value: 'volatile', label: '↕ Volatile' },
]

const riskColor = (v) => v <= 3 ? '#10B981' : v <= 6 ? '#F59E0B' : '#EF4444'

export default function ClimateForm({ open, onClose, stakeholderId, currentClimate }) {
  const toast = useToast()
  const updateStakeholderClimate = useIslandStore((s) => s.updateStakeholderClimate)
  const [form, setForm] = useState({
    weather_type: currentClimate?.weather_type || 'clear',
    sentiment: currentClimate?.sentiment || 'neutral',
    trend: currentClimate?.trend || 'stable',
    risk_level: currentClimate?.risk_level || 5,
    notes: currentClimate?.notes || '',
  })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    background: '#0B1120', border: '1px solid #1C2B45',
    color: 'rgba(255,255,255,0.92)', fontSize: 14, outline: 'none',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await updateClimate(stakeholderId, form)
      updateStakeholderClimate(stakeholderId, data)
      toast('Climate updated', 'success')
      onClose()
    } catch (err) {
      toast(err.response?.data?.message || 'Update failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Update Climate">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Weather */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Weather</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {WEATHER_TYPES.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => set('weather_type', w)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 11,
                  background: form.weather_type === w ? '#1C2B45' : '#0B1120',
                  border: `1px solid ${form.weather_type === w ? '#3B82F6' : '#1C2B45'}`,
                  color: 'rgba(255,255,255,0.92)', textTransform: 'capitalize',
                }}
              >
                <WeatherEffect weather_type={w} size="small" />
                {w}
              </button>
            ))}
          </div>
        </div>
        {/* Sentiment */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Sentiment</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SENTIMENTS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => set('sentiment', s.value)}
                style={{
                  padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 13,
                  background: form.sentiment === s.value ? s.color + '22' : 'transparent',
                  border: `1px solid ${form.sentiment === s.value ? s.color : '#1C2B45'}`,
                  color: form.sentiment === s.value ? s.color : 'rgba(255,255,255,0.55)',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        {/* Trend */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Trend</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {TRENDS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => set('trend', t.value)}
                style={{
                  padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 13,
                  background: form.trend === t.value ? 'rgba(59,130,246,0.15)' : 'transparent',
                  border: `1px solid ${form.trend === t.value ? '#3B82F6' : '#1C2B45'}`,
                  color: form.trend === t.value ? '#3B82F6' : 'rgba(255,255,255,0.55)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {/* Risk slider */}
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
            <span>Risk Level</span>
            <span style={{ color: riskColor(form.risk_level), fontWeight: 700 }}>{form.risk_level}/10</span>
          </label>
          <input
            type="range" min="1" max="10" value={form.risk_level}
            onChange={(e) => set('risk_level', Number(e.target.value))}
            style={{ width: '100%', accentColor: riskColor(form.risk_level) }}
          />
        </div>
        {/* Notes */}
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Notes</label>
          <textarea
            style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose}
            style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #1C2B45', background: 'transparent', color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" disabled={loading}
            style={{ padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#3B82F6,#14B8A6)', color: 'white', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving…' : 'Update'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
