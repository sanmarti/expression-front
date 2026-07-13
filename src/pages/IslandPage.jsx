import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import IslandMap from '../components/island/IslandMap.jsx'
import AddCampModal from '../components/island/AddCampModal.jsx'
import CockpitWidget from '../components/island/CockpitWidget.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import useIslandStore from '../store/islandStore.js'
import useAuthStore from '../store/authStore.js'
import { getStakeholders } from '../api/stakeholders.js'
import { useClimateSync } from '../hooks/useClimateSync.js'

export default function IslandPage() {
  const navigate = useNavigate()
  const { user, org } = useAuthStore()
  const { setStakeholders, isLoading, setLoading } = useIslandStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedZone, setSelectedZone] = useState(null)
  const [clickPos, setClickPos] = useState(null)
  useClimateSync()

  useEffect(() => {
    setLoading(true)
    getStakeholders()
      .then(({ data }) => setStakeholders(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [setStakeholders, setLoading])

  const handleZoneClick = (zone, pos) => {
    setSelectedZone(zone)
    setClickPos(pos ?? null)
    setShowAddModal(true)
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#060a16' }}>
      {/* Full-screen background video */}
      <video
        autoPlay muted loop playsInline
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          zIndex: 0, pointerEvents: 'none',
        }}
      >
        <source src="/bg.mp4" type="video/mp4" />
      </video>
      {/* TopBar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(11,17,32,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(28,43,69,0.8)',
        display: 'flex', alignItems: 'center', padding: '0 20px', height: 56,
      }}>
        <div style={{
          fontSize: 18, fontWeight: 700,
          background: 'linear-gradient(135deg,#3B82F6,#14B8A6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          marginRight: 'auto',
        }}>
          Expression
        </div>

        {org && (
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.70)' }}>
            {org.name}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
          <NavBtn onClick={() => navigate('/members')}>Members</NavBtn>
          <NavBtn onClick={() => navigate('/profile')}>Settings</NavBtn>
        </div>
      </div>

      {/* Map */}
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <Spinner size={48} />
        </div>
      ) : (
        <IslandMap onZoneClick={handleZoneClick} />
      )}

      {/* FAB */}
      <button
        onClick={() => { setSelectedZone(null); setShowAddModal(true) }}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 50,
          width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg,#3B82F6,#14B8A6)',
          color: 'white', fontSize: 28, fontWeight: 300,
          boxShadow: '0 4px 24px rgba(59,130,246,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        +
      </button>

      <CockpitWidget />

      <AddCampModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        defaultZone={selectedZone}
        defaultPosition={clickPos}
      />
    </div>
  )
}

function NavBtn({ onClick, children, style: extraStyle }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 8, border: '1px solid #1C2B45',
        background: 'transparent', color: 'rgba(255,255,255,0.70)', cursor: 'pointer', fontSize: 13,
        ...extraStyle,
      }}
    >
      {children}
    </button>
  )
}
