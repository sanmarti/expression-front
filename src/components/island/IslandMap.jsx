import { useNavigate } from 'react-router-dom'
import IslandZones from './IslandZones.jsx'
import Campfire from './Campfire.jsx'
import PlaneIcon from './PlaneIcon.jsx'
import { updateStakeholder } from '../../api/stakeholders.js'
import useIslandStore from '../../store/islandStore.js'

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
      {/* Ocean background */}
      <defs>
        <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#0C4A6E" />
          <stop offset="100%" stopColor="#082F49" />
        </radialGradient>
      </defs>
      <rect width="1000" height="700" fill="url(#oceanGrad)" />
      {/* Wave lines */}
      <path d="M0,200 Q250,180 500,200 Q750,220 1000,200" fill="none" stroke="white" strokeWidth="1" opacity="0.06" />
      <path d="M0,350 Q250,330 500,350 Q750,370 1000,350" fill="none" stroke="white" strokeWidth="1" opacity="0.06" />
      <path d="M0,500 Q250,480 500,500 Q750,520 1000,500" fill="none" stroke="white" strokeWidth="1" opacity="0.06" />

      {/* Island base */}
      <path
        d="M180,320 Q200,180 360,110 Q500,60 660,110 Q820,170 860,320 Q880,460 700,570 Q500,630 280,570 Q120,490 180,320 Z"
        fill="#2D5016"
      />

      {/* Zones */}
      <IslandZones onZoneClick={onZoneClick} />

      {/* Campfires */}
      {stakeholders.map((s) => (
        <Campfire
          key={s.id}
          stakeholder={s}
          onDragEnd={handleDragEnd}
          onClick={() => navigate(`/stakeholders/${s.id}`)}
        />
      ))}

      {/* Plane */}
      <PlaneIcon stakeholders={stakeholders} />
    </svg>
  )
}
