import { useState } from 'react'
import WeatherEffect from './WeatherEffect.jsx'
import StakeholderTooltip from './StakeholderTooltip.jsx'

export default function Campfire({ stakeholder, isDragging, onMouseDown }) {
  const [hovered, setHovered] = useState(false)

  const x = (stakeholder.position_x ?? 50) * 10
  const y = (stakeholder.position_y ?? 50) * 7

  // Build climate object — supports both flat (from list API) and nested
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

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e) }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Invisible hit area — ensures <g> is hittable even though all visual children have pointer-events:none */}
      <circle r={22} fill="none" style={{ pointerEvents: 'all' }} />

      {/* WeatherEffect renders the full 6-indicator visual centered at 0,0 */}
      <g transform="translate(0, 0)" style={{ pointerEvents: 'none' }}>
        <WeatherEffect climate={climate} size="small" />
      </g>

      {/* name label */}
      <text
        y="30"
        textAnchor="middle"
        fontSize="11"
        fill="white"
        stroke="#0B1120"
        strokeWidth="3"
        paintOrder="stroke"
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {stakeholder.name}
      </text>

      {/* tooltip */}
      {hovered && !isDragging && (
        <g style={{ pointerEvents: 'none' }}>
          <StakeholderTooltip stakeholder={{ ...stakeholder, climate }} />
        </g>
      )}
    </g>
  )
}
