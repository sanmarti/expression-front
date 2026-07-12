const arrows = { up: '↑', down: '↓', stable: '→', volatile: '↕' }
const colors = { up: '#10B981', down: '#EF4444', stable: '#3B82F6', volatile: '#F59E0B' }

export default function TrendIndicator({ trend, showLabel = true }) {
  const t = trend || 'stable'
  return (
    <span style={{ color: colors[t], fontWeight: 700, fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {arrows[t]}
      {showLabel && <span style={{ fontSize: 12, fontWeight: 500, textTransform: 'capitalize' }}>{t}</span>}
    </span>
  )
}
