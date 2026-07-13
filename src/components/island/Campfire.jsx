import { getClimateIcon } from '../../constants/climate.js'

const STATUS_CLR = { favorable: '#22c55e', attention: '#f59e0b', critical: '#ef4444', unknown: '#6b7280' }

function fmtAge(iso) {
  if (!iso) return null
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

// Animation speed by urgency — critical feels urgent, favorable feels calm
const ANIM = {
  favorable: { ping: '3.5s', glow: '3s',   flow: '2.5s' },
  attention:  { ping: '2s',   glow: '2s',   flow: '1.4s' },
  critical:   { ping: '1s',   glow: '0.9s', flow: '0.7s' },
  unknown:    { ping: '6s',   glow: '5s',   flow: '4s'   },
}

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
    storm          = 'stable',
    visibility     = 'partial',
    tide           = 'stable',
    uv_index       = 'neutral',
    overall_status = 'unknown',
  } = climate

  const statusColor = STATUS_CLR[overall_status] || '#6b7280'
  const campEmoji   = stakeholder.emoji || '🏕️'
  const anim        = ANIM[overall_status] || ANIM.unknown
  const lastUpdate  = fmtAge(stakeholder.climate_updated_at ?? stakeholder.climate?.updated_at)

  const vals = { storm, wind, temperature, visibility, tide, uv_index }

  // Card geometry (SVG units) — foreignObject is taller than cardH to avoid
  // clipping when SVG scales down on smaller screens (SVG units ≠ CSS px)
  const cardW = 124
  const cardH = 56   // geometry anchor (line endpoint + glow rect)
  const foH   = 96   // foreignObject height — generous to prevent clip
  const lineH = 22
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
        width={cardW + 8} height={foH + lineH + 10}
        fill="transparent"
      />

      {/* Connector line — animated dashes flow upward toward the card */}
      <line
        x1={0} y1={0} x2={0} y2={cy + cardH}
        stroke={statusColor} strokeWidth="1" strokeOpacity="0.55"
        strokeDasharray="4 3"
        style={{ animation: `flow ${anim.flow} linear infinite`, pointerEvents: 'none' }}
      />

      {/* Anchor dot */}
      <circle
        r={4}
        fill={statusColor}
        stroke="rgba(0,0,0,0.45)" strokeWidth="1"
        style={{ pointerEvents: 'none' }}
      />

      {/* Ping ring — expands outward from anchor like a radar blip */}
      <circle
        r={4} fill="none"
        stroke={statusColor} strokeWidth="1.5"
        style={{ transformOrigin: '0 0', animation: `ping ${anim.ping} ease-out infinite`, pointerEvents: 'none' }}
      />

      {/* Weather card */}
      <foreignObject x={cx} y={cy} width={cardW} height={foH} style={{ pointerEvents: 'none', overflow: 'visible' }}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            width: cardW + 'px',
            background: 'rgba(6,10,22,0.90)',
            backdropFilter: 'blur(14px)',
            borderRadius: 10,
            padding: '7px 9px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            fontFamily: 'system-ui,-apple-system,sans-serif',
          }}
        >
          {/* Row 1: camp emoji in circle + camp name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, lineHeight: 1,
            }}>
              {campEmoji}
            </div>
            <span style={{
              fontSize: 9, fontWeight: 700,
              color: 'rgba(255,255,255,0.70)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {stakeholder.name}
            </span>
          </div>

          {/* Row 2: 6 indicator emojis */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {INDICATORS.map((key) => (
              <span key={key} style={{ fontSize: 12, lineHeight: 1, userSelect: 'none' }}>
                {getClimateIcon(key, vals[key]) || '○'}
              </span>
            ))}
          </div>

          {/* Row 3: last update */}
          {lastUpdate && (
            <div style={{
              fontSize: 8, color: 'rgba(255,255,255,0.28)',
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
              Updated {lastUpdate}
            </div>
          )}

        </div>
      </foreignObject>

      {/* Pulsing glow border — rendered after foreignObject so it sits on top */}
      <rect
        x={cx} y={cy} width={cardW} height={cardH}
        rx={10} ry={10}
        fill="none"
        stroke={statusColor} strokeWidth="2"
        style={{ animation: `card-glow ${anim.glow} ease-in-out infinite`, pointerEvents: 'none' }}
      />
    </g>
  )
}
