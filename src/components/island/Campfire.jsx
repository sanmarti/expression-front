import { getClimateIcon } from '../../constants/climate.js'

const STATUS_CLR = { favorable: '#22c55e', attention: '#f59e0b', critical: '#ef4444', unknown: '#6b7280' }

const ANIM = {
  favorable: { ping: '3.5s', glow: '3s',   flow: '2.5s' },
  attention:  { ping: '2s',   glow: '2s',   flow: '1.4s' },
  critical:   { ping: '1s',   glow: '0.9s', flow: '0.7s' },
  unknown:    { ping: '6s',   glow: '5s',   flow: '4s'   },
}

const INDICATORS = ['storm', 'wind', 'temperature', 'visibility', 'tide', 'uv_index']

// Hex geometry constants — computed once
const R     = 40                              // circumradius (vertex-to-center)
const APO   = R * Math.sin(Math.PI / 3)      // apothem (center-to-flat-edge) ≈ 34.6
const IRAD  = 25                              // indicator emoji ring radius

// Flat-top hexagon: vertices at 0°, 60°, 120°, 180°, 240°, 300°
const HEX_PTS = Array.from({ length: 6 }, (_, i) => {
  const a = (Math.PI / 3) * i
  return `${(R * Math.cos(a)).toFixed(2)},${(R * Math.sin(a)).toFixed(2)}`
}).join(' ')

// Slightly enlarged hex for hit testing
const HEX_HIT = Array.from({ length: 6 }, (_, i) => {
  const a = (Math.PI / 3) * i
  const r = R + 8
  return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`
}).join(' ')

// 6 positions clockwise from top (-90°)
const IPOS = Array.from({ length: 6 }, (_, i) => {
  const a = (Math.PI / 3) * i - Math.PI / 2
  return { x: +(IRAD * Math.cos(a)).toFixed(2), y: +(IRAD * Math.sin(a)).toFixed(2) }
})

const LINE_H = 24   // gap from anchor dot to hex bottom edge

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
  const vals        = { storm, wind, temperature, visibility, tide, uv_index }

  // cy = y-coordinate of hex center (negative = above anchor)
  const cy = -(LINE_H + APO)

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
      <polygon points={HEX_HIT} transform={`translate(0,${cy})`} fill="transparent" />

      {/* Connector line — animated dashes flowing toward anchor */}
      <line
        x1={0} y1={0} x2={0} y2={cy + APO}
        stroke={statusColor} strokeWidth="1.2" strokeOpacity="0.55"
        strokeDasharray="4 3"
        style={{ animation: `flow ${anim.flow} linear infinite`, pointerEvents: 'none' }}
      />

      {/* Anchor dot */}
      <circle r={4.5} fill={statusColor} stroke="rgba(0,0,0,0.5)" strokeWidth="1.2"
        style={{ pointerEvents: 'none' }} />

      {/* Ping radar ring */}
      <circle r={4.5} fill="none" stroke={statusColor} strokeWidth="1.5"
        style={{ transformOrigin: '0 0', animation: `ping ${anim.ping} ease-out infinite`, pointerEvents: 'none' }} />

      {/* Hex inner shadow layer */}
      <polygon
        points={HEX_PTS}
        transform={`translate(1.5,${cy + 1.5})`}
        fill="rgba(0,0,0,0.45)"
        style={{ pointerEvents: 'none' }}
      />

      {/* Hex background fill */}
      <polygon
        points={HEX_PTS}
        transform={`translate(0,${cy})`}
        fill="rgba(5,9,20,0.88)"
        style={{ pointerEvents: 'none' }}
      />

      {/* Inner hex ring — subtle secondary border */}
      <polygon
        points={Array.from({ length: 6 }, (_, i) => {
          const a = (Math.PI / 3) * i
          const r = R - 4
          return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`
        }).join(' ')}
        transform={`translate(0,${cy})`}
        fill="none"
        stroke={statusColor} strokeWidth="0.6" strokeOpacity="0.20"
        style={{ pointerEvents: 'none' }}
      />

      {/* Animated glow border */}
      <polygon
        points={HEX_PTS}
        transform={`translate(0,${cy})`}
        fill="none"
        stroke={statusColor} strokeWidth="2"
        style={{ animation: `card-glow ${anim.glow} ease-in-out infinite`, pointerEvents: 'none' }}
      />

      {/* Center camp emoji */}
      <text
        x={0} y={cy + 1}
        textAnchor="middle" dominantBaseline="central"
        fontSize="18"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {campEmoji}
      </text>

      {/* 6 indicator emojis in a ring */}
      {INDICATORS.map((key, i) => (
        <text
          key={key}
          x={IPOS[i].x}
          y={cy + IPOS[i].y + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="11"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {getClimateIcon(key, vals[key]) || '·'}
        </text>
      ))}

      {/* Camp name label below anchor */}
      <text
        x={0} y={13}
        textAnchor="middle"
        dominantBaseline="hanging"
        fontSize="7.5"
        fill="rgba(255,255,255,0.70)"
        fontFamily="system-ui,-apple-system,sans-serif"
        fontWeight="700"
        letterSpacing="0.8"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {(stakeholder.name || '').toUpperCase()}
      </text>
    </g>
  )
}
