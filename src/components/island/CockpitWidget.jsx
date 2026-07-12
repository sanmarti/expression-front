import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore.js'
import { getAvatar } from '../../constants/avatars.js'

export default function CockpitWidget() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const avatar = getAvatar(user?.selected_avatar)
  const [imgSrc, setImgSrc] = useState(avatar?.src)
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={() => navigate('/cockpit')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="My Cockpit"
      style={{
        position: 'fixed', bottom: 28, left: 28, zIndex: 50,
        background: 'rgba(11,17,32,0.85)', backdropFilter: 'blur(12px)',
        border: `2px solid ${hovered ? (avatar?.color || '#3B82F6') : 'rgba(28,43,69,0.8)'}`,
        borderRadius: 16, padding: '10px 14px 10px 10px',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: hovered ? `0 4px 24px ${avatar?.color || '#3B82F6'}40` : '0 4px 12px rgba(0,0,0,0.4)',
        transition: 'all 0.18s',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {avatar ? (
        <img
          src={imgSrc}
          onError={() => setImgSrc(avatar.placeholder)}
          alt={avatar.name}
          style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${avatar.color}`, flexShrink: 0 }}
        />
      ) : (
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1C2B45', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          ✈
        </div>
      )}
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.90)', lineHeight: 1.2 }}>My Cockpit</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', marginTop: 2 }}>
          {avatar ? avatar.name : 'Choose pilot'}
        </div>
      </div>
    </button>
  )
}
