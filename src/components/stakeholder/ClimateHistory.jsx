import { useState, useEffect } from 'react'
import { getClimateHistory } from '../../api/climate.js'
import WeatherBadge from './WeatherBadge.jsx'
import Badge from '../ui/Badge.jsx'
import Spinner from '../ui/Spinner.jsx'

const entryIcons = { manual: '✏️', api: '🔗', auto: '🤖' }

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

const sentimentVariant = { positive:'green', neutral:'gray', negative:'red', mixed:'amber', unknown:'gray' }

export default function ClimateHistory({ stakeholderId }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    getClimateHistory(stakeholderId)
      .then(({ data }) => setEntries(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [stakeholderId])

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.entry_type === filter)

  const tabStyle = (active) => ({
    padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
    background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
    border: `1px solid ${active ? '#3B82F6' : '#1C2B45'}`,
    color: active ? '#3B82F6' : 'rgba(255,255,255,0.55)',
  })

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all','manual','api','auto'].map((f) => (
          <button key={f} style={tabStyle(filter === f)} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <div style={{ color: 'rgba(255,255,255,0.30)', textAlign: 'center', padding: 32 }}>
          No history entries yet
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {filtered.map((entry, i) => (
          <div key={entry.id || i} style={{ display: 'flex', gap: 16, paddingBottom: 20, position: 'relative' }}>
            {/* timeline line */}
            {i < filtered.length - 1 && (
              <div style={{ position: 'absolute', left: 18, top: 36, bottom: 0, width: 2, background: '#1C2B45' }} />
            )}
            {/* icon */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: '#1C2B45',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16,
            }}>
              {entryIcons[entry.entry_type] || '📋'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)' }}>
                  {relativeTime(entry.created_at)}
                </span>
                {entry.weather_type && <WeatherBadge weather_type={entry.weather_type} />}
                {entry.sentiment && (
                  <Badge variant={sentimentVariant[entry.sentiment] || 'gray'}>
                    {entry.sentiment}
                  </Badge>
                )}
              </div>
              {entry.notes && (
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.70)', lineHeight: 1.5 }}>
                  {entry.notes}
                </p>
              )}
              {entry.source && (
                <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.40)' }}>
                  Source: {entry.source}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
