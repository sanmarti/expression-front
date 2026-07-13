import { useState } from 'react'
import WeatherEffect from '../island/WeatherEffect.jsx'
import { updateClimate } from '../../api/climate.js'
import useIslandStore from '../../store/islandStore.js'
import { useToast } from '../ui/Toast.jsx'
import { CLIMATE_INDICATORS as INDICATORS } from '../../constants/climate.js'

const STATUS_BANNER = {
  favorable: { bg: 'rgba(34,197,94,0.15)',  border: '#22c55e', icon: '🟢', text: 'Favorable — This stakeholder is well managed' },
  attention:  { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', icon: '🟡', text: 'Attention — Some indicators need monitoring' },
  critical:   { bg: 'rgba(239,68,68,0.15)',  border: '#ef4444', icon: '🔴', text: 'Critical — Immediate action required', blink: true },
  unknown:    { bg: 'rgba(107,114,128,0.15)',border: '#6b7280', icon: '⚫', text: 'Unknown — Insufficient data available' },
}

function IndicatorCard({ indicator, value, onChange, isOpen, onToggle }) {
  const current = indicator.options.find((o) => o.value === value) || indicator.options[0]

  return (
    <div style={{ background: '#0B1120', borderRadius: 12, padding: 16, position: 'relative' }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
        {indicator.label}
      </div>

      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%', textAlign: 'left', background: 'none', border: '1px solid #1C2B45',
          borderRadius: 8, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <span style={{ fontSize: 22 }}>{current.icon}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>{current.label}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>{current.desc}</div>
        </div>
        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.40)', fontSize: 12 }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', left: 0, right: 0, zIndex: 20,
          background: '#141E35', border: '1px solid #1C2B45', borderRadius: 10,
          overflow: 'hidden', top: '100%', marginTop: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}>
          {indicator.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(indicator.key, opt.value); onToggle() }}
              style={{
                width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', cursor: 'pointer', border: 'none',
                background: opt.value === value ? '#1C2B45' : 'transparent',
                borderLeft: `3px solid ${opt.value === value ? '#3B82F6' : 'transparent'}`,
              }}
            >
              <span style={{ fontSize: 20 }}>{opt.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>{opt.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)' }}>{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ClimateCard({ stakeholder }) {
  const toast = useToast()
  const updateStakeholderClimate = useIslandStore((s) => s.updateStakeholderClimate)

  // Merge flat + nested climate fields
  const c = stakeholder.climate || {}
  const flat = stakeholder // flat fields from list API
  const initClimate = {
    temperature:    c.temperature    ?? flat.temperature    ?? 'temperate',
    wind:           c.wind           ?? flat.wind           ?? 'calm',
    storm:          c.storm          ?? flat.storm          ?? 'stable',
    visibility:     c.visibility     ?? flat.visibility     ?? 'clear',
    tide:           c.tide           ?? flat.tide           ?? 'stable',
    uv_index:       c.uv_index       ?? flat.uv_index       ?? 'neutral',
    overall_status: c.overall_status ?? flat.overall_status ?? 'unknown',
    notes:          c.notes          ?? flat.climate_notes  ?? '',
  }

  const [form, setForm] = useState(initClimate)
  const [saving, setSaving] = useState(false)
  const [openKey, setOpenKey] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggleDropdown = (key) => setOpenKey((prev) => (prev === key ? null : key))

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await updateClimate(stakeholder.id, form)
      updateStakeholderClimate(stakeholder.id, data)
      setForm((f) => ({ ...f, overall_status: data.overall_status }))
      toast('Climate updated ✓', 'success')
    } catch (err) {
      toast(err.response?.data?.message || 'Update failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const banner = STATUS_BANNER[form.overall_status] || STATUS_BANNER.unknown

  return (
    <div>
      {/* Overall status banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
        borderRadius: 12, marginBottom: 20,
        background: banner.bg, border: `1px solid ${banner.border}`,
        animation: banner.blink ? 'pulse-slow 2s ease-in-out infinite' : 'none',
      }}>
        <span style={{ fontSize: 20 }}>{banner.icon}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>{banner.text}</span>
        <div style={{ marginLeft: 'auto' }}>
          <WeatherEffect climate={form} size="medium" />
        </div>
      </div>

      {/* 6-indicator grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {INDICATORS.map((ind) => (
          <IndicatorCard
            key={ind.key}
            indicator={ind}
            value={form[ind.key]}
            onChange={set}
            isOpen={openKey === ind.key}
            onToggle={() => toggleDropdown(ind.key)}
          />
        ))}
      </div>

      {/* Notes */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Notes</div>
        <textarea
          value={form.notes || ''}
          onChange={(e) => set('notes', e.target.value)}
          rows={3}
          placeholder="Add notes about this stakeholder…"
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 8,
            background: '#0B1120', border: '1px solid #1C2B45',
            color: 'rgba(255,255,255,0.92)', fontSize: 14, resize: 'vertical', outline: 'none',
          }}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: '11px 28px', borderRadius: 8, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
          background: 'linear-gradient(135deg,#3B82F6,#14B8A6)',
          color: 'white', fontWeight: 700, fontSize: 14, opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? 'Saving…' : 'Update Climate'}
      </button>
    </div>
  )
}
