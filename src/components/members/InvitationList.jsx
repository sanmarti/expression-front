import { cancelInvitation } from '../../api/members.js'
import Badge from '../ui/Badge.jsx'
import { useToast } from '../ui/Toast.jsx'

const roleVariant = { admin: 'blue', member: 'gray', viewer: 'amber' }

function daysUntil(dateStr) {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function InvitationList({ invitations, onRefresh }) {
  const toast = useToast()

  const handleCancel = async (id) => {
    if (!confirm('Cancel this invitation?')) return
    try {
      await cancelInvitation(id)
      toast('Invitation cancelled', 'info')
      onRefresh()
    } catch {
      toast('Failed to cancel', 'error')
    }
  }

  if (!invitations.length) {
    return <div style={{ color: 'rgba(255,255,255,0.30)', fontSize: 14, padding: '16px 0' }}>No pending invitations</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {invitations.map((inv) => (
        <div key={inv.id} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px', background: '#0B1120', border: '1px solid #1C2B45', borderRadius: 10,
        }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.92)' }}>{inv.email}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', marginLeft: 12 }}>
              Expires in {daysUntil(inv.expires_at)}d
            </span>
          </div>
          <Badge variant={roleVariant[inv.role] || 'gray'}>{inv.role}</Badge>
          <button
            onClick={() => handleCancel(inv.id)}
            style={{
              padding: '4px 12px', borderRadius: 6, border: '1px solid #EF444440',
              background: 'transparent', color: '#EF4444', cursor: 'pointer', fontSize: 12,
            }}
          >
            Cancel
          </button>
        </div>
      ))}
    </div>
  )
}
