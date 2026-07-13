import { useState } from 'react'
import { INDICATORS, getAvatar } from '../../constants/avatars.js'

const ROLE_CFG = {
  admin:  { label: 'Admin',     bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.35)',  color: '#3B82F6' },
  member: { label: 'Member',    bg: 'rgba(20,184,166,0.15)',  border: 'rgba(20,184,166,0.35)',  color: '#14B8A6' },
  viewer: { label: 'View only', bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.35)', color: '#9ca3af' },
}

function AvatarDisplay({ member, size = 120 }) {
  const av = getAvatar(member.selected_avatar)
  const [src, setSrc] = useState(av?.src)

  if (av) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%', overflow: 'hidden',
        border: `3px solid ${av.color}`, boxShadow: `0 0 28px ${av.color}45`,
      }}>
        <img
          src={src}
          onError={() => setSrc(av.placeholder)}
          alt={member.display_name || member.email}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 20%' }}
        />
      </div>
    )
  }

  const initials = (member.display_name || member.email || '?')
    .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(59,130,246,0.10)', border: '3px solid rgba(59,130,246,0.20)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.30, fontWeight: 700, color: 'rgba(255,255,255,0.40)',
    }}>
      {initials}
    </div>
  )
}

function ScoreBar({ indicator, value }) {
  const pct = Math.round(Math.max(0, Math.min(100, value ?? 0)))
  const scoreColor = pct >= 80 ? '#10B981' : pct >= 55 ? '#F59E0B' : '#EF4444'
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13 }}>{indicator.icon}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{indicator.label}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor }}>{pct}</span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 4,
          background: `linear-gradient(90deg, ${indicator.color}88, ${scoreColor})`,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}

export default function MemberCard({ member, canRemove, onRemove }) {
  const roleCfg = ROLE_CFG[member.role] || ROLE_CFG.viewer
  const hasScores = member.cockpit && Object.keys(member.cockpit).length > 0
  const hasProfile = !!(member.display_name && member.selected_avatar)
  const isDemo = String(member.id).startsWith('demo-')

  const joinedDate = member.joined_at
    ? new Date(member.joined_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null

  return (
    <div style={{
      background: '#141E35', border: '1px solid #1C2B45', borderRadius: 20,
      padding: '32px 24px 24px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', position: 'relative',
    }}>
      {isDemo && (
        <div style={{
          position: 'absolute', top: 14, left: 14,
          fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 6, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          Preview
        </div>
      )}

      {canRemove && !isDemo && (
        <button
          onClick={() => onRemove(member.id)}
          style={{
            position: 'absolute', top: 14, right: 14, padding: '4px 10px',
            borderRadius: 6, border: '1px solid rgba(239,68,68,0.25)',
            background: 'transparent', color: 'rgba(239,68,68,0.55)', cursor: 'pointer', fontSize: 11, fontWeight: 600,
          }}
        >
          Remove
        </button>
      )}

      {/* Avatar */}
      <AvatarDisplay member={member} size={120} />

      {/* Identity */}
      <div style={{ textAlign: 'center', marginTop: 18, marginBottom: 14 }}>
        {hasProfile ? (
          <>
            <div style={{ fontSize: 19, fontWeight: 700, color: 'rgba(255,255,255,0.92)', marginBottom: 4 }}>
              {member.display_name}
            </div>
            {member.job_title && (
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 4, letterSpacing: '0.02em' }}>
                {member.job_title}
              </div>
            )}
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)' }}>{member.email}</div>
          </>
        ) : (
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)' }}>{member.email}</div>
        )}
      </div>

      {/* Role + joined */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <span style={{
          fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20,
          background: roleCfg.bg, border: `1px solid ${roleCfg.border}`, color: roleCfg.color,
        }}>
          {roleCfg.label}
        </span>
        {joinedDate && (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>since {joinedDate}</span>
        )}
      </div>

      {/* Cockpit scores */}
      <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14, textAlign: 'center' }}>
          Cockpit
        </div>
        {hasScores ? (
          INDICATORS.map((ind) => (
            <ScoreBar key={ind.id} indicator={ind} value={member.cockpit[ind.id]} />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>✈️</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
              {hasProfile ? 'Cockpit not filled yet' : 'Profile not completed'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
