import { useState } from 'react'
import WeatherEffect from '../island/WeatherEffect.jsx'
import { updateClimate } from '../../api/climate.js'
import useIslandStore from '../../store/islandStore.js'
import { useToast } from '../ui/Toast.jsx'

// ── Indicator definitions ────────────────────────────────────────────────────
const INDICATORS = [
  {
    key: 'temperature',
    label: 'Activity Level',
    options: [
      { value: 'cold',      icon: '❄️', label: 'Cold',      desc: 'Inactive — low engagement' },
      { value: 'temperate', icon: '🌤️', label: 'Temperate', desc: 'Normal — regular contact' },
      { value: 'warm',      icon: '☀️', label: 'Warm',      desc: 'Active — frequent interaction' },
      { value: 'hot',       icon: '🔥', label: 'Hot',       desc: 'Urgent — immediate attention' },
    ],
  },
  {
    key: 'wind',
    label: 'Influence & Power',
    options: [
      { value: 'calm',   icon: '🍃', label: 'Calm',   desc: 'Low influence on decisions' },
      { value: 'breeze', icon: '💨', label: 'Breeze', desc: 'Some influence in their area' },
      { value: 'windy',  icon: '🌬️', label: 'Windy',  desc: 'Significant influence' },
      { value: 'gale',   icon: '🌀', label: 'Gale',   desc: 'Major decision maker' },
    ],
  },
  {
    key: 'storm',
    label: 'Risk & Conflict',
    options: [
      { value: 'clear',   icon: '☀️', label: 'Clear',   desc: 'No risk — stable relationship' },
      { value: 'cloudy',  icon: '⛅', label: 'Cloudy',  desc: 'Minor concerns — monitor' },
      { value: 'rainy',   icon: '🌧️', label: 'Rainy',   desc: 'Active issues — needs attention' },
      { value: 'stormy',  icon: '⛈️', label: 'Stormy',  desc: 'High conflict — critical situation' },
    ],
  },
  {
    key: 'visibility',
    label: 'Information Quality',
    options: [
      { value: 'foggy',   icon: '🌫️', label: 'Foggy',   desc: 'Unknown — no reliable data' },
      { value: 'misty',   icon: '😶‍🌫️', label: 'Misty',  desc: 'Limited — few data points' },
      { value: 'partial', icon: '🌤️', label: 'Partial', desc: 'Moderate — some gaps' },
      { value: 'clear',   icon: '🔭', label: 'Clear',   desc: 'Full visibility — well informed' },
    ],
  },
  {
    key: 'tide',
    label: 'Trend & Momentum',
    options: [
      { value: 'low',    icon: '📉', label: 'Low',    desc: 'Declining — losing interest' },
      { value: 'stable', icon: '➡️', label: 'Stable', desc: 'Stable — no change expected' },
      { value: 'high',   icon: '📈', label: 'High',   desc: 'Growing — increasing engagement' },
      { value: 'surge',  icon: '🌊', label: 'Surge',  desc: 'Volatile — unpredictable' },
    ],
  },
  {
    key: 'uv_index',
    label: 'Alignment & Support',
    options: [
      { value: 'blocked',   icon: '🚫', label: 'Blocked',   desc: 'Opposed — actively against' },
      { value: 'neutral',   icon: '🌑', label: 'Neutral',   desc: 'Neutral — no clear position' },
      { value: 'favorable', icon: '🌤️', label: 'Favorable', desc: 'Supportive — generally aligned' },
      { value: 'optimal',   icon: '✨', label: 'Optimal',   desc: 'Champion — active promoter' },
    ],
  },
]

const STATUS_BANNER = {
  favorable: { bg: 'rgba(34,197,94,0.15)',  border: '#22c55e', icon: '🟢', text: 'Favorable — This stakeholder is well managed' },
  attention:  { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', icon: '🟡', text: 'Attention — Some indicators need monitoring' },
  critical:   { bg: 'rgba(239,68,68,0.15)',  border: '#ef4444', icon: '🔴', text: 'Critical — Immediate action required', blink: true },
  unknown:    { bg: 'rgba(107,114,128,0.15)',border: '#6b7280', icon: '⚫', text: 'Unknown — Insufficient data available' },
}

function IndicatorCard({ indicator, value, onChange }) {
  const [open, setOpen] = useState(false)
  const current = indicator.options.find((o) => o.value === value) || indicator.options[0]

  return (
    <div style={{ background: '#0B1120', borderRadius: 12, padding: 16, position: 'relative' }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
        {indicator.label}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
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
        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.40)', fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
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
              onClick={() => { onChange(indicator.key, opt.value); setOpen(false) }}
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
    storm:          c.storm          ?? flat.storm          ?? 'clear',
    visibility:     c.visibility     ?? flat.visibility     ?? 'clear',
    tide:           c.tide           ?? flat.tide           ?? 'stable',
    uv_index:       c.uv_index       ?? flat.uv_index       ?? 'neutral',
    overall_status: c.overall_status ?? flat.overall_status ?? 'unknown',
    notes:          c.notes          ?? flat.climate_notes  ?? '',
  }

  const [form, setForm] = useState(initClimate)
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

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
