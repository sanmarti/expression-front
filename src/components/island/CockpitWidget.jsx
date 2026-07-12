import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore.js'
import { getAvatar, INDICATORS } from '../../constants/avatars.js'
import { getCockpitScore } from '../../api/cockpit.js'

function ScoreBar({ label, icon, color, score }) {
  const pct = score ?? 0
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
          {icon} {label.toUpperCase()}
        </span>
        <span style={{ fontSize: 12, color, fontWeight: 700, fontFamily: 'monospace' }}>
          {score != null ? `${score}%` : '—'}
        </span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: 3, transition: 'width 0.6s ease',
          boxShadow: `0 0 8px ${color}88`,
        }} />
      </div>
    </div>
  )
}

function FloatingChip({ emoji, score, color, style: extraStyle }) {
  return (
    <div style={{
      position: 'absolute',
      background: 'rgba(6,10,22,0.88)',
      border: `1px solid ${color}55`,
      borderRadius: 20,
      padding: '5px 10px 5px 7px',
      display: 'flex', alignItems: 'center', gap: 5,
      boxShadow: `0 0 12px ${color}33`,
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      zIndex: 51,
      ...extraStyle,
    }}>
      <span style={{ fontSize: 15 }}>{emoji}</span>
      <span style={{ fontSize: 11, color, fontWeight: 700, fontFamily: 'monospace' }}>
        {score != null ? `${score}%` : '—'}
      </span>
    </div>
  )
}

export default function CockpitWidget() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const avatar = getAvatar(user?.selected_avatar)
  const [imgSrc, setImgSrc] = useState(avatar?.src)
  const [hovered, setHovered] = useState(false)
  const [scores, setScores] = useState({})

  useEffect(() => {
    getCockpitScore()
      .then(({ data }) => setScores(data.scores || data || {}))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (avatar) setImgSrc(avatar.src)
  }, [avatar?.id])

  const accentColor = avatar?.color || '#3B82F6'

  return (
    <div style={{ position: 'fixed', bottom: 28, left: 28, zIndex: 50 }}>
      {/* Floating indicator chips above card */}
      {INDICATORS.map((ind, i) => (
        <FloatingChip
          key={ind.id}
          emoji={ind.icon}
          score={scores[ind.id] ?? null}
          color={ind.color}
          style={{ bottom: 'calc(100% + 10px)', left: i * 88 }}
        />
      ))}

      {/* Main card */}
      <button
        onClick={() => navigate('/cockpit')}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title="My Cockpit"
        style={{
          background: 'rgba(8,13,28,0.90)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1.5px solid ${hovered ? accentColor : 'rgba(255,255,255,0.10)'}`,
          borderRadius: 20,
          padding: '20px 22px',
          cursor: 'pointer',
          display: 'flex', flexDirection: 'column', gap: 16,
          width: 380,
          boxShadow: hovered
            ? `0 0 24px ${accentColor}40, 0 8px 32px rgba(0,0,0,0.5)`
            : '0 4px 20px rgba(0,0,0,0.5)',
          transition: 'all 0.18s',
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
          textAlign: 'left',
        }}
      >
        {/* Avatar + title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            border: `3px solid ${accentColor}`,
            boxShadow: `0 0 16px ${accentColor}55`,
          }}>
            {avatar ? (
              <img
                src={imgSrc}
                onError={() => setImgSrc(avatar.placeholder)}
                alt={user?.display_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#1C2B45', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>✈</div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 4 }}>MY COCKPIT</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.95)', letterSpacing: '0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.display_name || (avatar ? 'Pilot' : 'Choose pilot')}
            </div>
          </div>
          <div style={{ fontSize: 24, opacity: 0.20, flexShrink: 0 }}>✈</div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: `linear-gradient(90deg, ${accentColor}66 0%, transparent 100%)` }} />

        {/* Score bars */}
        <div>
          {INDICATORS.map((ind) => (
            <ScoreBar
              key={ind.id}
              label={ind.label}
              icon={ind.icon}
              color={ind.color}
              score={scores[ind.id] ?? null}
            />
          ))}
        </div>

        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.20)', fontFamily: 'monospace', letterSpacing: '0.10em', textAlign: 'right' }}>
          CLICK TO ENTER COCKPIT →
        </div>
      </button>
    </div>
  )
}
