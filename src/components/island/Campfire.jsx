import { useState } from 'react'
import StakeholderTooltip from './StakeholderTooltip.jsx'

const TEMP_FILL   = { cold: '#60A5FA', temperate: '#34D399', warm: '#FBBF24', hot: '#F87171' }
const STATUS_CLR  = { favorable: '#22c55e', attention: '#f59e0b', critical: '#ef4444', unknown: '#6b7280' }
const STORM_ICON  = { clear: '☀', cloudy: '☁', rainy: '🌧', stormy: '⚡' }
const WIND_ICON   = { calm: '·', breeze: '〜', windy: '≋', gale: '⟫' }
const TIDE_ICON   = { low: '↓', stable: '→', high: '↑', surge: '↕' }
const TIDE_CLR    = { low: '#ef4444', stable: '#9ca3af', high: '#22c55e', surge: '#f59e0b' }
const TEMP_LABEL  = { cold: '❄', temperate: '🌿', warm: '☀', hot: '🔥' }

// Regular hexagon, flat-top, radius r
function hexPoints(r) {
  return [0, 1, 2, 3, 4, 5]
    .map((i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2
      return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`
    })
    .join(' ')
}

function Chip({ x, y, width = 34, height = 15, icon, label, labelColor = 'rgba(255,255,255,0.85)', borderColor = 'rgba(255,255,255,0.12)' }) {
  return (
    <g transform={`translate(${x},${y})`} style={{ pointerEvents: 'none' }}>
      <rect
        x={-width / 2} y={-height / 2}
        width={width} height={height} rx={height / 2}
        fill="rgba(8,13,28,0.82)"
        stroke={borderColor} strokeWidth="0.8"
      />
      <text
        textAnchor="middle" dominantBaseline="central"
        fontSize="8.5" fill={labelColor}
        style={{ userSelect: 'none', fontFamily: 'monospace', letterSpacing: '0.02em' }}
      >
        {icon}{icon ? ' ' : ''}{label}
      </text>
    </g>
  )
}

export default function Campfire({ stakeholder, isDragging, onMouseDown }) {
  const [hovered, setHovered] = useState(false)

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
    weather_type:   stakeholder.weather_type,
  }

  const {
    temperature    = 'temperate',
    wind           = 'calm',
    storm          = 'clear',
    tide           = 'stable',
    overall_status = 'unknown',
  } = climate

  const fillColor   = TEMP_FILL[temperature]  || '#34D399'
  const statusColor = STATUS_CLR[overall_status] || '#6b7280'
  const isCritical  = overall_status === 'critical'
  const nameLen     = stakeholder.name?.length ?? 8
  const nameW       = Math.max(52, nameLen * 6.2 + 16)

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e) }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Invisible hit area */}
      <circle r={28} fill="none" style={{ pointerEvents: 'all' }} />

      <g style={{ pointerEvents: 'none' }}>
        {/* Outer status glow ring */}
        <circle
          r="21" fill="none"
          stroke={statusColor} strokeWidth="6" strokeOpacity="0.12"
        />

        {/* Rotating dashed scan ring */}
        <circle
          r="21" fill="none"
          stroke={statusColor} strokeWidth="1"
          strokeDasharray="5 31"
          style={{
            animation: 'spin 10s linear infinite',
            transformOrigin: '0 0',
            strokeOpacity: 0.6,
          }}
        />

        {/* Critical pulse outer ring */}
        {isCritical && (
          <circle
            r="24" fill="none"
            stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.4"
            style={{ animation: 'pulse-slow 1.2s ease-in-out infinite' }}
          />
        )}

        {/* Hexagonal pin */}
        <polygon
          points={hexPoints(13)}
          fill={fillColor}
          fillOpacity="0.88"
          stroke={statusColor}
          strokeWidth="2"
        />

        {/* Inner hex ring */}
        <polygon
          points={hexPoints(10)}
          fill="none"
          stroke="rgba(255,255,255,0.20)"
          strokeWidth="0.8"
        />

        {/* Camp emoji */}
        <text
          textAnchor="middle" dominantBaseline="central"
          fontSize="11"
          style={{ userSelect: 'none' }}
        >
          🏕️
        </text>

        {/* ── Floating data chips ─────────────────────── */}

        {/* Storm — top */}
        <Chip
          x={0} y={-32}
          width={40} height={14}
          icon={STORM_ICON[storm] || '☀'}
          label={storm || 'clear'}
          borderColor={statusColor}
        />

        {/* Wind — top-right */}
        <Chip
          x={30} y={-16}
          width={32} height={13}
          icon={WIND_ICON[wind] || '·'}
          label={wind || 'calm'}
          labelColor="#93c5fd"
          borderColor="#3b82f6"
        />

        {/* Tide — top-left */}
        <Chip
          x={-30} y={-16}
          width={28} height={13}
          icon={TIDE_ICON[tide] || '→'}
          label={tide || 'stable'}
          labelColor={TIDE_CLR[tide] || '#9ca3af'}
          borderColor={TIDE_CLR[tide] || '#9ca3af'}
        />

        {/* Temperature — bottom-right */}
        <Chip
          x={28} y={16}
          width={36} height={13}
          icon={TEMP_LABEL[temperature] || '🌿'}
          label={temperature || 'temperate'}
          labelColor={fillColor}
          borderColor={fillColor}
        />

        {/* Name label */}
        <g transform="translate(0, 30)">
          <rect
            x={-nameW / 2} y="-7"
            width={nameW} height="14" rx="7"
            fill="rgba(8,13,28,0.88)"
            stroke={statusColor} strokeWidth="0.8"
          />
          <text
            textAnchor="middle" dominantBaseline="central"
            fontSize="9.5" fontWeight="700"
            fill="rgba(255,255,255,0.92)"
            style={{ userSelect: 'none', fontFamily: 'monospace', letterSpacing: '0.04em', textTransform: 'uppercase' }}
          >
            {stakeholder.name}
          </text>
        </g>
      </g>

      {/* Hover tooltip */}
      {hovered && !isDragging && (
        <g style={{ pointerEvents: 'none' }}>
          <StakeholderTooltip stakeholder={{ ...stakeholder, climate }} />
        </g>
      )}
    </g>
  )
}
