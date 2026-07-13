import { getClimateIcon } from '../../constants/climate.js'

const STATUS_CLR = { favorable: '#22c55e', attention: '#f59e0b', critical: '#ef4444', unknown: '#6b7280' }
const STATUS_LBL = { favorable: '● FAVORABLE', attention: '● ATTENTION', critical: '● CRITICAL', unknown: '○ UNKNOWN' }

const ROWS = [
  {
    key: 'temperature',
    label: 'Temperature',
    map: { cold: 'Cold', temperate: 'Moderate', warm: 'Warm', hot: 'Hot' },
    color: { cold: '#ef4444', temperate: '#3b82f6', warm: '#22c55e', hot: '#f59e0b' },
  },
  {
    key: 'wind',
    label: 'Wind',
    map: { calm: 'Calm', breeze: 'Breeze', windy: 'Windy', gale: 'Gale' },
    color: { calm: '#22c55e', breeze: '#3b82f6', windy: '#f59e0b', gale: '#ef4444' },
  },
  {
    key: 'storm',
    label: 'Nature Force',
    map: { stable: 'Stable', variable: 'Variable', unsettled: 'Unsettled', hazardous: 'Hazardous' },
    color: { stable: '#22c55e', variable: '#3b82f6', unsettled: '#f59e0b', hazardous: '#ef4444' },
  },
  {
    key: 'tide',
    label: 'Pressure',
    map: { low: 'Low', stable: 'Stable', high: 'Rising', surge: 'Accelerating' },
    color: { low: '#ef4444', stable: '#3b82f6', high: '#22c55e', surge: '#f59e0b' },
  },
  {
    key: 'visibility',
    label: 'Visibility',
    map: { foggy: 'Foggy', misty: 'Misty', partial: 'Partial', clear: 'Clear' },
    color: { foggy: '#ef4444', misty: '#f59e0b', partial: '#3b82f6', clear: '#22c55e' },
  },
  {
    key: 'uv_index',
    label: 'Sky Conditions',
    map: { blocked: 'Blocked', neutral: 'Neutral', favorable: 'Favorable', optimal: 'Optimal' },
    color: { blocked: '#ef4444', neutral: '#f59e0b', favorable: '#3b82f6', optimal: '#22c55e' },
  },
]

export default function StakeholderTooltip({ stakeholder }) {
  const c = stakeholder.climate || {}
  const status = c.overall_status || 'unknown'
  const statusColor = STATUS_CLR[status]

  return (
    <foreignObject x="70" y="-150" width="180" height="210" style={{ pointerEvents: 'none', overflow: 'visible' }}>
      <div style={{
        background: 'rgba(6,10,22,0.94)',
        border: `1px solid ${statusColor}`,
        borderRadius: 8,
        padding: '7px 9px',
        boxShadow: `0 0 14px ${statusColor}33, 0 8px 24px rgba(0,0,0,0.7)`,
        fontFamily: 'monospace',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {stakeholder.name}
          </div>
          <div style={{ fontSize: 7, fontWeight: 700, color: statusColor, letterSpacing: '0.06em' }}>
            {STATUS_LBL[status]}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: `linear-gradient(90deg, ${statusColor}88 0%, transparent 100%)`, marginBottom: 6 }} />

        {/* Indicator grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
          {ROWS.map((row) => {
            const val = c[row.key]
            const label = row.map[val] || val || '—'
            const color = row.color[val] || 'rgba(255,255,255,0.50)'
            return (
              <div key={row.key} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.06em' }}>
                  {row.label}
                </div>
                <div style={{ fontSize: 8, color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <span style={{ fontSize: 9 }}>{getClimateIcon(row.key, val)}</span>
                  {label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom scan line */}
        <div style={{ marginTop: 6, height: 1, background: `linear-gradient(90deg, transparent 0%, ${statusColor}55 50%, transparent 100%)` }} />
        <div style={{ marginTop: 3, fontSize: 6, color: 'rgba(255,255,255,0.18)', textAlign: 'right', letterSpacing: '0.08em' }}>
          CLICK TO ENTER CAMP
        </div>
      </div>
    </foreignObject>
  )
}
