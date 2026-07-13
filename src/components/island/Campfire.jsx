import { useState } from 'react'

const STATUS_CLR = { favorable: '#22c55e', attention: '#f59e0b', critical: '#ef4444', unknown: '#6b7280' }
const TEMP_FILL  = { cold: '#60A5FA', temperate: '#34D399', warm: '#FBBF24', hot: '#F87171' }

const STORM_EMOJI = { clear: '☀️', cloudy: '⛅', rainy: '🌧️', stormy: '⛈️' }
const WIND_EMOJI  = { calm: '🌀', breeze: '🍃', windy: '💨', gale: '🌬️' }
const TIDE_EMOJI  = { low: '⬇️', stable: '➡️', high: '⬆️', surge: '⚡' }
const TEMP_EMOJI  = { cold: '❄️', temperate: '🌿', warm: '🌤️', hot: '🔥' }

function EmojiChip({ x, y, emoji, borderColor = 'rgba(255,255,255,0.18)', r = 11 }) {
  return (
    <g transform={`translate(${x},${y})`} style={{ pointerEvents: 'none' }}>
      <circle r={r} fill="rgba(6,10,22,0.78)" stroke={borderColor} strokeWidth="0.8" />
      <text
        textAnchor="middle" dominantBaseline="central"
        fontSize={r * 1.35}
        style={{ userSelect: 'none' }}
      >
        {emoji}
      </text>
    </g>
  )
}

export default function Campfire({ stakeholder, isDragging, onMouseDown, onHoverChange }) {
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

  const campEmoji   = stakeholder.emoji || '🏕️'
  const fillColor   = TEMP_FILL[temperature]    || '#34D399'
  const statusColor = STATUS_CLR[overall_status] || '#6b7280'
  const isCritical  = overall_status === 'critical'
  const nameLen     = stakeholder.name?.length ?? 8
  const nameW       = Math.max(52, nameLen * 6.2 + 16)

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseEnter={() => { setHovered(true); onHoverChange?.(stakeholder.id, true) }}
      onMouseLeave={() => { setHovered(false); onHoverChange?.(stakeholder.id, false) }}
      onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e) }}
      onClick={(e) => e.stopPropagation()}
    >
      <circle r={36} fill="none" style={{ pointerEvents: 'all' }} />

      <g style={{ pointerEvents: 'none' }}>
        {/* Soft status glow */}
        <circle r="20" fill={statusColor} fillOpacity="0.08" />

        {/* Rotating scan ring */}
        <circle
          r="20" fill="none"
          stroke={statusColor} strokeWidth="1"
          strokeDasharray="5 25"
          style={{ animation: 'spin 12s linear infinite', transformOrigin: '0 0', strokeOpacity: 0.55 }}
        />

        {isCritical && (
          <circle r="23" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.4"
            style={{ animation: 'pulse-slow 1.2s ease-in-out infinite' }} />
        )}

        {/* Camp emoji — foreignObject keeps all emojis the same visual size */}
        <foreignObject x="-18" y="-18" width="36" height="36">
          <div xmlns="http://www.w3.org/1999/xhtml" style={{
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, lineHeight: 1,
            userSelect: 'none',
          }}>
            {campEmoji}
          </div>
        </foreignObject>

        {/* ── 4 floating emoji chips ─────────────────────── */}
        {/* Storm — top */}
        <EmojiChip x={0}   y={-30} emoji={STORM_EMOJI[storm] || '☀️'} borderColor={statusColor} r={11} />
        {/* Wind  — right */}
        <EmojiChip x={28}  y={-14} emoji={WIND_EMOJI[wind]   || '🌀'} borderColor="#3b82f6" r={10} />
        {/* Tide  — left */}
        <EmojiChip x={-28} y={-14} emoji={TIDE_EMOJI[tide]   || '➡️'} borderColor="#14b8a6" r={10} />
        {/* Temp  — bottom-right */}
        <EmojiChip x={24}  y={16}  emoji={TEMP_EMOJI[temperature] || '🌿'} borderColor={fillColor} r={10} />

        {/* Name pill */}
        <g transform="translate(0, 30)">
          <rect
            x={-nameW / 2} y="-7" width={nameW} height="14" rx="7"
            fill="rgba(6,10,22,0.86)" stroke={statusColor} strokeWidth="0.8"
          />
          <text
            textAnchor="middle" dominantBaseline="central"
            fontSize="9" fontWeight="700"
            fill="rgba(255,255,255,0.90)"
            style={{ userSelect: 'none', fontFamily: 'monospace', letterSpacing: '0.05em', textTransform: 'uppercase' }}
          >
            {stakeholder.name}
          </text>
        </g>
      </g>

    </g>
  )
}
