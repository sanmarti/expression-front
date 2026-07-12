import { useNavigate } from 'react-router-dom'
import Campfire from './Campfire.jsx'
import PlaneIcon from './PlaneIcon.jsx'
import { updateStakeholder } from '../../api/stakeholders.js'
import useIslandStore from '../../store/islandStore.js'

// Invisible click zones mapped to the photo's geography
const ZONES = [
  { id: 'mountain', d: 'M350,30 Q500,0 650,30 Q700,120 620,200 Q500,240 380,200 Q300,130 350,30 Z' },
  { id: 'forest',   d: 'M200,200 Q350,130 500,160 Q600,200 580,350 Q500,420 350,400 Q200,370 180,280 Z' },
  { id: 'jungle',   d: 'M580,160 Q720,130 820,200 Q860,300 800,400 Q700,450 600,400 Q560,320 580,160 Z' },
  { id: 'beach',    d: 'M200,450 Q400,500 650,470 Q750,430 780,520 Q500,590 180,530 Z' },
  { id: 'coast',    d: 'M100,300 Q160,200 250,180 Q200,320 200,450 Q130,400 100,300 Z' },
  { id: 'volcano',  d: 'M460,0 Q540,0 560,60 Q500,100 440,60 Z' },
]

export default function IslandMap({ onZoneClick }) {
  const navigate = useNavigate()
  const { stakeholders, updateStakeholderClimate } = useIslandStore()

  const handleDragEnd = async (id, newX, newY) => {
    try {
      await updateStakeholder(id, { position_x: newX, position_y: newY })
      updateStakeholderClimate(id, { position_x: newX, position_y: newY })
    } catch {
      // silent
    }
  }

  return (
    <svg
      viewBox="0 0 1000 700"
      width="100%"
      height="100vh"
      preserveAspectRatio="xMidYMid slice"
      style={{ display: 'block' }}
    >
      {/* Photo background */}
      <image
        href="/island.png"
        x="0"
        y="0"
        width="1000"
        height="700"
        preserveAspectRatio="xMidYMid slice"
      />

      {/* Dark overlay to improve pin readability */}
      <rect width="1000" height="700" fill="rgba(0,0,0,0.18)" />

      {/* Invisible clickable zones mapped to photo geography */}
      {ZONES.map((z) => (
        <path
          key={z.id}
          d={z.d}
          fill="transparent"
          style={{ cursor: 'pointer' }}
          onClick={() => onZoneClick && onZoneClick(z.id)}
        />
      ))}

      {/* Fallback: click anywhere else opens modal with no pre-selected zone */}
      <rect
        width="1000"
        height="700"
        fill="transparent"
        style={{ cursor: 'crosshair' }}
        onClick={() => onZoneClick && onZoneClick(null)}
      />

      {/* Campfire pins — rendered on top of everything */}
      {stakeholders.map((s) => (
        <Campfire
          key={s.id}
          stakeholder={s}
          onDragEnd={handleDragEnd}
          onClick={() => navigate(`/stakeholders/${s.id}`)}
        />
      ))}

      {/* Animated plane */}
      <PlaneIcon stakeholders={stakeholders} />
    </svg>
  )
}
