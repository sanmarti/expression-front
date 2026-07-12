import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'

const roleVariant = { admin: 'blue', member: 'gray', viewer: 'amber' }

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function MemberCard({ member, canRemove, onRemove }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 20px', background: '#0B1120',
      border: '1px solid #1C2B45', borderRadius: 12,
    }}>
      <Avatar name={member.display_name || member.email} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.92)', fontSize: 14 }}>
          {member.display_name || '—'}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
          {member.email}
        </div>
      </div>
      <Badge variant={roleVariant[member.role] || 'gray'}>{member.role}</Badge>
      {member.joined_at && (
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)', whiteSpace: 'nowrap' }}>
          {formatDate(member.joined_at)}
        </span>
      )}
      {canRemove && (
        <button
          onClick={() => onRemove(member.id)}
          style={{
            padding: '6px 12px', borderRadius: 8, border: '1px solid #1C2B45',
            background: 'transparent', color: 'rgba(255,255,255,0.40)', cursor: 'pointer', fontSize: 12,
          }}
        >
          Remove
        </button>
      )}
    </div>
  )
}
