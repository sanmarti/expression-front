import { useState } from 'react'
import WeatherEffect from '../island/WeatherEffect.jsx'
import WeatherBadge from './WeatherBadge.jsx'
import TrendIndicator from './TrendIndicator.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'
import Badge from '../ui/Badge.jsx'
import ClimateForm from './ClimateForm.jsx'
import { updateClimate } from '../../api/climate.js'
import useIslandStore from '../../store/islandStore.js'
import { useToast } from '../ui/Toast.jsx'

const sentimentVariant = { positive:'green', neutral:'gray', negative:'red', mixed:'amber', unknown:'gray' }
const riskColor = (v) => v <= 3 ? '#10B981' : v <= 6 ? '#F59E0B' : '#EF4444'

export default function ClimateCard({ stakeholder }) {
  const toast = useToast()
  const updateStakeholderClimate = useIslandStore((s) => s.updateStakeholderClimate)
  const [showForm, setShowForm] = useState(false)
  const [notes, setNotes] = useState(stakeholder.climate?.notes || '')

  const c = stakeholder.climate || {}

  const saveNotes = async () => {
    try {
      const { data } = await updateClimate(stakeholder.id, { notes })
      updateStakeholderClimate(stakeholder.id, data)
    } catch {
      toast('Failed to save notes', 'error')
    }
  }

  return (
    <div>
      {/* Header with weather animation */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: 24, background: '#0B1120', borderRadius: 12, marginBottom: 16,
      }}>
        <WeatherEffect weather_type={c.weather_type} size="medium" />
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.92)', textTransform: 'capitalize' }}>
            {c.weather_type || 'clear'} conditions
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
            Current climate status
          </div>
        </div>
      </div>

      {/* Grid of indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ background: '#0B1120', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weather</div>
          <WeatherBadge weather_type={c.weather_type} />
        </div>
        <div style={{ background: '#0B1120', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sentiment</div>
          <Badge variant={sentimentVariant[c.sentiment] || 'gray'} style={{ textTransform: 'capitalize' }}>
            {c.sentiment || 'unknown'}
          </Badge>
        </div>
        <div style={{ background: '#0B1120', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trend</div>
          <TrendIndicator trend={c.trend} />
        </div>
        <div style={{ background: '#0B1120', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Risk Level <span style={{ color: riskColor(c.risk_level || 5), fontWeight: 700 }}>{c.risk_level || 5}/10</span>
          </div>
          <ProgressBar value={c.risk_level || 5} max={10} color={riskColor(c.risk_level || 5)} />
        </div>
      </div>

      {/* Notes */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
          rows={4}
          placeholder="Add notes about this stakeholder's climate..."
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 8,
            background: '#0B1120', border: '1px solid #1C2B45',
            color: 'rgba(255,255,255,0.92)', fontSize: 14, resize: 'vertical', outline: 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#3B82F6,#14B8A6)', color: 'white', fontWeight: 600, fontSize: 14,
          }}
        >
          Update Climate
        </button>
      </div>

      <ClimateForm
        open={showForm}
        onClose={() => setShowForm(false)}
        stakeholderId={stakeholder.id}
        currentClimate={c}
      />
    </div>
  )
}
