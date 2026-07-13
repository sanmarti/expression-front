import { getClimateIcon } from '../../constants/climate.js'

const STATUS_CLR = { favorable: '#22c55e', attention: '#f59e0b', critical: '#ef4444', unknown: '#6b7280' }
const TEMP_LBL   = { cold: 'Cold', temperate: 'Moderate', warm: 'Warm', hot: 'Hot' }

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

  const { temperature = 'temperate', storm = 'clear', overall_status = 'unknown' } = climate
  const statusColor = STATUS_CLR[overall_status] || '#6b7280'
  const stormEmoji  = getClimateIcon('storm', storm) || '☀️'
  const tempLabel   = TEMP_LBL[temperature] || 'Moderate'

  // Card geometry (SVG units)
  const cardW = 148
  const cardH = 56
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
      {/* Transparent hit area covering card + line + pin */}
      <rect
        x={cx - 4} y={cy - 4}
        width={cardW + 8} height={cardH + lineH + 10}
        fill="transparent"
      />

      {/* Connector line — pin to card bottom */}
      <line
        x1={0} y1={0} x2={0} y2={cy + cardH}
        stroke="rgba(255,255,255,0.35)" strokeWidth="1"
        style={{ pointerEvents: 'none' }}
      />

      {/* Anchor dot */}
      <circle
        r={4}
        fill="rgba(255,255,255,0.80)"
        stroke="rgba(0,0,0,0.45)" strokeWidth="1"
        style={{ pointerEvents: 'none' }}
      />

      {/* Weather card */}
      <foreignObject x={cx} y={cy} width={cardW} height={cardH} style={{ pointerEvents: 'none' }}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            width: cardW + 'px', height: cardH + 'px',
            background: 'rgba(6,10,22,0.88)',
            backdropFilter: 'blur(14px)',
            border: `1px solid ${statusColor}44`,
            borderRadius: 10,
            padding: '8px 10px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontFamily: 'system-ui,-apple-system,sans-serif',
          }}
        >
          {/* Row 1: status dot + camp name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden' }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: statusColor,
              boxShadow: `0 0 6px ${statusColor}cc`,
            }} />
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: 'rgba(255,255,255,0.60)',
              letterSpacing: '0.07em', textTransform: 'uppercase',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {stakeholder.name}
            </span>
          </div>

          {/* Row 2: temperature label + storm emoji */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: 18, fontWeight: 700, color: '#fff',
              letterSpacing: '-0.01em', lineHeight: 1,
            }}>
              {tempLabel}
            </span>
            <span style={{ fontSize: 26, lineHeight: 1, userSelect: 'none' }}>
              {stormEmoji}
            </span>
          </div>
        </div>
      </foreignObject>
    </g>
  )
}
