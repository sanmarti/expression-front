import { useState } from 'react'
import WeatherEffect from './WeatherEffect.jsx'
import StakeholderTooltip from './StakeholderTooltip.jsx'

export default function Campfire({ stakeholder, onDragEnd, onClick }) {
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [startPos, setStartPos] = useState(null)
  const [offset, setOffset] = useState({ dx: 0, dy: 0 })

  const x = (stakeholder.position_x ?? 50) * 10
  const y = (stakeholder.position_y ?? 50) * 7

  const handleMouseDown = (e) => {
    e.stopPropagation()
    setDragging(true)
    setStartPos({ mx: e.clientX, my: e.clientY, ox: x, oy: y })
    setOffset({ dx: 0, dy: 0 })
  }

  const handleMouseMove = (e) => {
    if (!dragging || !startPos) return
    const svg = e.currentTarget.ownerSVGElement
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const scaleX = 1000 / rect.width
    const scaleY = 700 / rect.height
    const dx = (e.clientX - startPos.mx) * scaleX
    const dy = (e.clientY - startPos.my) * scaleY
    setOffset({ dx, dy })
  }

  const handleMouseUp = (e) => {
    if (!dragging || !startPos) return
    setDragging(false)
    const svg = e.currentTarget.ownerSVGElement
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const scaleX = 1000 / rect.width
    const scaleY = 700 / rect.height
    const newX = Math.round((startPos.ox + (e.clientX - startPos.mx) * scaleX) / 10)
    const newY = Math.round((startPos.oy + (e.clientY - startPos.my) * scaleY) / 7)
    onDragEnd && onDragEnd(stakeholder.id, newX, newY)
    setOffset({ dx: 0, dy: 0 })
    setStartPos(null)
  }

  const tx = x + (dragging ? offset.dx : 0)
  const ty = y + (dragging ? offset.dy : 0)

  return (
    <g
      transform={`translate(${tx}, ${ty})`}
      className="campfire"
      style={{ cursor: dragging ? 'grabbing' : 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setDragging(false) }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={(e) => { if (!dragging) { e.stopPropagation(); onClick && onClick() } }}
    >
      {/* weather above */}
      <g transform="translate(-14, -55)">
        <WeatherEffect weather_type={stakeholder.climate?.weather_type} size="small" />
      </g>

      {/* camp circle */}
      <circle r="20" fill="#1C2B45" stroke="#F59E0B" strokeWidth="2" />
      <text y="6" textAnchor="middle" fontSize="16" style={{ userSelect: 'none' }}>🏕️</text>

      {/* name label */}
      <text
        y="35"
        textAnchor="middle"
        fontSize="11"
        fill="white"
        stroke="#0B1120"
        strokeWidth="3"
        paintOrder="stroke"
        style={{ userSelect: 'none' }}
      >
        {stakeholder.name}
      </text>

      {hovered && !dragging && <StakeholderTooltip stakeholder={stakeholder} />}
    </g>
  )
}
