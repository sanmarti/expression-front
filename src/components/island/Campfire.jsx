import { useState } from 'react'
import WeatherEffect from './WeatherEffect.jsx'
import StakeholderTooltip from './StakeholderTooltip.jsx'

export default function Campfire({ stakeholder, isDragging, onMouseDown, onClick }) {
  const [hovered, setHovered] = useState(false)

  const x = (stakeholder.position_x ?? 50) * 10
  const y = (stakeholder.position_y ?? 50) * 7

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e) }}
      onClick={(e) => { e.stopPropagation(); !isDragging && onClick() }}
    >
      {/* weather above */}
      <g transform="translate(-14, -55)" style={{ pointerEvents: 'none' }}>
        <WeatherEffect weather_type={stakeholder.climate?.weather_type} size="small" />
      </g>

      {/* camp circle */}
      <circle r="20" fill="#1C2B45" stroke="#F59E0B" strokeWidth="2" />
      <text y="6" textAnchor="middle" fontSize="16" style={{ userSelect: 'none', pointerEvents: 'none' }}>🏕️</text>

      {/* name label */}
      <text
        y="35"
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

      {/* tooltip — pointerEvents none so it never triggers mouseLeave on parent */}
      {hovered && !isDragging && (
        <g style={{ pointerEvents: 'none' }}>
          <StakeholderTooltip stakeholder={stakeholder} />
        </g>
      )}
    </g>
  )
}
