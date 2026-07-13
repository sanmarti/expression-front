// Renders combined SVG visual for a climate_state with 6 indicators
// Used both on the island map (small) and in ClimateCard (medium/large)

const TEMP_FILL = { cold: '#60A5FA', temperate: '#34D399', warm: '#FBBF24', hot: '#F87171' }
const STATUS_STROKE = {
  favorable: { stroke: '#22c55e', width: 3, dash: '' },
  attention:  { stroke: '#f59e0b', width: 3, dash: '' },
  critical:   { stroke: '#ef4444', width: 4, dash: '', blink: true },
  unknown:    { stroke: '#6b7280', width: 2, dash: '4 2' },
}
const UV_GLOW = {
  blocked:   { color: '#ef4444', opacity: 0.35 },
  neutral:   null,
  favorable: { color: '#60A5FA', opacity: 0.25 },
  optimal:   { color: '#FCD34D', opacity: 0.45, pulse: true },
}
const VISIBILITY_OPACITY = { foggy: 0.3, misty: 0.55, partial: 0.75, clear: 1.0 }
const TIDE_ARROW = { low: { sym: '↓', color: '#ef4444' }, stable: { sym: '→', color: '#9ca3af' }, high: { sym: '↑', color: '#22c55e' }, surge: { sym: '↕', color: '#f59e0b', blink: true } }

function WindLines({ wind }) {
  if (wind === 'calm') return null
  const counts = { breeze: 2, windy: 4, gale: 6 }
  const speed = { breeze: '3s', windy: '1.8s', gale: '0.9s' }
  const n = counts[wind] || 0
  const lines = Array.from({ length: n }, (_, i) => {
    const y = -22 + i * 8
    const len = wind === 'gale' ? 18 : wind === 'windy' ? 14 : 10
    return (
      <path
        key={i}
        d={`M-${len / 2},${y} Q0,${y - 3} ${len / 2},${y}`}
        fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round"
        style={{ animation: `drift ${speed[wind]} ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}
      />
    )
  })
  return <g>{lines}</g>
}

function StormIcon({ storm }) {
  if (storm === 'stable') return (
    <g transform="translate(0,-36)">
      <circle r="5" fill="#FCD34D" style={{ animation: 'pulse-slow 2s ease-in-out infinite' }} />
    </g>
  )
  if (storm === 'variable') return (
    <g transform="translate(0,-38)" style={{ animation: 'float 3s ease-in-out infinite' }}>
      <ellipse cx="0" cy="0" rx="9" ry="5" fill="#9ca3af" />
      <ellipse cx="5" cy="-3" rx="6" ry="4" fill="#d1d5db" />
    </g>
  )
  if (storm === 'unsettled') return (
    <g transform="translate(0,-38)" className="weather-rain">
      <ellipse cx="0" cy="0" rx="9" ry="5" fill="#6b7280" />
      <line x1="-5" y1="6" x2="-6" y2="13" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="0"  y1="6" x2="-1" y2="13" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5"  y1="6" x2="4"  y2="13" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  )
  if (storm === 'hazardous') return (
    <g transform="translate(0,-38)">
      <ellipse cx="0" cy="0" rx="10" ry="6" fill="#374151" />
      <polyline points="3,6 -1,13 3,13 -2,20" fill="none" stroke="#FCD34D" strokeWidth="2" strokeLinejoin="round" />
    </g>
  )
  return null
}

function UVGlow({ uv_index, r }) {
  const g = UV_GLOW[uv_index]
  if (!g) return null
  return (
    <circle
      r={r + 8}
      fill={g.color}
      fillOpacity={g.opacity}
      style={g.pulse ? { animation: 'pulse-slow 2s ease-in-out infinite' } : undefined}
    />
  )
}

export default function WeatherEffect({ climate = {}, size = 'small' }) {
  const r = size === 'large' ? 28 : size === 'medium' ? 20 : 14
  const dim = r * 3.5

  const {
    temperature = 'temperate',
    wind = 'calm',
    storm = 'stable',
    visibility = 'clear',
    tide = 'stable',
    uv_index = 'neutral',
    overall_status = 'unknown',
    // legacy single-field fallback
    weather_type,
  } = climate

  const fillColor = TEMP_FILL[temperature] || '#34D399'
  const strokeCfg = STATUS_STROKE[overall_status] || STATUS_STROKE.unknown
  const visOpacity = VISIBILITY_OPACITY[visibility] ?? 1
  const tideInfo = TIDE_ARROW[tide]

  // Fallback: if only weather_type (legacy), skip 6-indicator render
  const isLegacy = !climate.wind && weather_type

  if (isLegacy) {
    return <LegacyWeather weather_type={weather_type} size={size} />
  }

  return (
    <svg
      width={dim * 2} height={dim * 2}
      viewBox={`${-dim} ${-dim} ${dim * 2} ${dim * 2}`}
      overflow="visible"
      style={{ overflow: 'visible' }}
    >
      <g opacity={visOpacity}>
        {/* UV glow */}
        <UVGlow uv_index={uv_index} r={r} />

        {/* Fog halo */}
        {(visibility === 'foggy' || visibility === 'misty') && (
          <circle r={r + 12} fill="white"
            fillOpacity={visibility === 'foggy' ? 0.18 : 0.10}
            style={{ animation: 'float 4s ease-in-out infinite' }} />
        )}

        {/* Base circle (temperature color) */}
        <circle
          r={r}
          fill={fillColor}
          stroke={strokeCfg.stroke}
          strokeWidth={strokeCfg.width}
          strokeDasharray={strokeCfg.dash}
          style={strokeCfg.blink ? { animation: 'pulse-slow 1s ease-in-out infinite' } : undefined}
        />

        {/* Camp icon */}
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={r * 1.1}
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          🏕️
        </text>

        {/* Wind lines */}
        <WindLines wind={wind} />

        {/* Storm icon above */}
        <StormIcon storm={storm} />

        {/* Tide arrow below name — only medium/large */}
        {size !== 'small' && tideInfo && (
          <text
            y={r + 22}
            textAnchor="middle"
            fontSize="14"
            fontWeight="700"
            fill={tideInfo.color}
            style={tideInfo.blink ? { animation: 'twinkle 1s ease-in-out infinite' } : undefined}
          >
            {tideInfo.sym}
          </text>
        )}
      </g>
    </svg>
  )
}

// Kept for backward-compat (ClimateForm preview, history entries without 6 indicators)
function LegacyWeather({ weather_type: w, size }) {
  const dim = size === 'large' ? 80 : size === 'medium' ? 48 : 28
  return (
    <svg width={dim} height={dim} viewBox="0 0 40 40" style={{ overflow: 'visible' }}>
      {w === 'sunny' && (
        <g className="weather-sun">
          <circle cx="20" cy="20" r="8" fill="#FCD34D" />
          {[0,45,90,135,180,225,270,315].map((deg) => (
            <line key={deg} x1="20" y1="20"
              x2={20 + Math.cos((deg*Math.PI)/180)*14}
              y2={20 + Math.sin((deg*Math.PI)/180)*14}
              stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" className="sun-ray"
              style={{ transformOrigin:'20px 20px', animationDelay:`${deg/360}s` }}
            />
          ))}
        </g>
      )}
      {w === 'rainy' && (
        <g className="weather-rain">
          <ellipse cx="20" cy="16" rx="10" ry="6" fill="#6B7280" />
          <line x1="14" y1="24" x2="12" y2="32" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="24" x2="18" y2="32" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="26" y1="24" x2="24" y2="32" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}
      {(w === 'clear' || !w) && (
        <circle cx="20" cy="20" r="10" fill="rgba(59,130,246,0.15)" stroke="#3B82F6" strokeWidth="1" />
      )}
    </svg>
  )
}
