import { getClimateIcon } from '../../constants/climate.js'

const STATUS_CLR = { favorable: '#22c55e', attention: '#f59e0b', critical: '#ef4444', unknown: '#6b7280' }

const INDICATORS = ['storm', 'wind', 'temperature', 'visibility', 'tide', 'uv_index']

export default function Campfire({ stakeholder, isDragging, onMouseDown, onHoverChange }) {
  const x = (stakeholder.position_x ?? 50) * 10
  const y = (stakeholder.position_y ?? 50) * 7

  const climate = stakeholder.climate ?? {
    temperature:    stakeholder.temperature,
    wind:           stakeholder.wind,
    storm:          stakeholder.storm,
    visibility:     stakeholder.visibility,
    tide:           stakeholder.tide,
    uv_index:       stakeholder.uv_index,
    overall_status: stakeholder.overall_status,
  }

  const {
    temperature    = 'temperate',
    wind           = 'calm',
    storm          = 'clear',
    visibility     = 'partial',
    tide           = 'stable',
    uv_index       = 'neutral',
    overall_status = 'unknown',
  } = climate

  const statusColor = STATUS_CLR[overall_status] || '#6b7280'
  const campEmoji   = stakeholder.emoji || '🏕️'

  const vals = { storm, wind, temperature, visibility, tide, uv_index }

  // Card geometry (SVG units)
  const cardW = 152
  const cardH = 66
  const lineH = 28
  const cx    = -cardW / 2
  const cy    = -(cardH + lineH)

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseEnter={() => onHoverChange?.(stakeholder.id, true)}
      onMouseLeave={() => onHoverChange?.(stakeholder.id, false)}
      onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e) }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Transparent hit area */}
      <rect
        x={cx - 4} y={cy - 4}
        width={cardW + 8} height={cardH + lineH + 10}
        fill="transparent"
      />

      {/* Connector line — pin to card bottom */}
      <line
        x1={0} y1={0} x2={0} y2={cy + cardH}
        stroke={statusColor} strokeWidth="1" strokeOpacity="0.5"
        style={{ pointerEvents: 'none' }}
      />

      {/* Anchor dot — status colored */}
      <circle
        r={4}
        fill={statusColor}
        stroke="rgba(0,0,0,0.45)" strokeWidth="1"
        style={{ pointerEvents: 'none' }}
      />

      {/* Weather card */}
      <foreignObject x={cx} y={cy} width={cardW} height={cardH} style={{ pointerEvents: 'none' }}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            width: cardW + 'px', height: cardH + 'px',
            background: 'rgba(6,10,22,0.90)',
            backdropFilter: 'blur(14px)',
            border: `1.5px solid ${statusColor}`,
            borderRadius: 10,
            padding: '9px 11px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontFamily: 'system-ui,-apple-system,sans-serif',
          }}
        >
          {/* Row 1: camp emoji in circle + camp name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, lineHeight: 1,
            }}>
              {campEmoji}
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: 'rgba(255,255,255,0.70)',
              letterSpacing: '0.07em', textTransform: 'uppercase',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {stakeholder.name}
            </span>
          </div>

          {/* Row 2: 6 indicator emojis */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 2,
          }}>
            {INDICATORS.map((key) => (
              <span key={key} style={{ fontSize: 15, lineHeight: 1, userSelect: 'none' }}>
                {getClimateIcon(key, vals[key]) || '○'}
              </span>
            ))}
          </div>
        </div>
      </foreignObject>
    </g>
  )
}
