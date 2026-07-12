import WeatherEffect from './WeatherEffect.jsx'
import Badge from '../ui/Badge.jsx'

const sentimentColor = { positive: 'green', neutral: 'gray', negative: 'red', mixed: 'amber', unknown: 'gray' }

export default function StakeholderTooltip({ stakeholder }) {
  const c = stakeholder.climate || {}
  return (
    <foreignObject x="20" y="-60" width="180" height="90" style={{ pointerEvents: 'none' }}>
      <div
        style={{
          background: '#141E35',
          border: '1px solid #1C2B45',
          borderRadius: 10,
          padding: '8px 12px',
          fontSize: 12,
          color: 'rgba(255,255,255,0.92)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{stakeholder.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <WeatherEffect weather_type={c.weather_type} size="small" />
          <span style={{ color: 'rgba(255,255,255,0.55)', textTransform: 'capitalize' }}>
            {c.weather_type || 'clear'}
          </span>
        </div>
        {c.sentiment && (
          <div style={{ marginTop: 4 }}>
            <Badge variant={sentimentColor[c.sentiment] || 'gray'}>{c.sentiment}</Badge>
          </div>
        )}
      </div>
    </foreignObject>
  )
}
