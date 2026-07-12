import { useEffect, useState } from 'react'
import { getMembers, getInvitations, removeMember } from '../api/members.js'
import MemberCard from '../components/members/MemberCard.jsx'
import InviteModal from '../components/members/InviteModal.jsx'
import InvitationList from '../components/members/InvitationList.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useOrganization } from '../hooks/useOrganization.js'
import useAuthStore from '../store/authStore.js'
import { useNavigate } from 'react-router-dom'

export default function MembersPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { isAdmin } = useOrganization()
  const org = useAuthStore((s) => s.org)
  const [members, setMembers] = useState([])
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)

  const load = async () => {
    try {
      const [m, i] = await Promise.all([getMembers(), getInvitations()])
      setMembers(m.data)
      setInvitations(i.data)
    } catch {
      toast('Failed to load members', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleRemove = async (id) => {
    if (!confirm('Remove this member?')) return
    try {
      await removeMember(id)
      setMembers((prev) => prev.filter((m) => m.id !== id))
      toast('Member removed', 'info')
    } catch {
      toast('Failed to remove', 'error')
    }
  }

  const maxMembers = org?.subscription?.max_members || 3
  const maxStakeholders = org?.subscription?.max_stakeholders || 5
  const currentStakeholders = org?.stakeholder_count || 0
  const limitReached = members.length >= maxMembers

  const pageStyle = { minHeight: '100vh', background: '#0B1120', padding: '24px 32px' }

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => navigate('/island')} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: 14, padding: 0 }}>
              ← Island
            </button>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'rgba(255,255,255,0.92)', margin: 0 }}>Team Members</h1>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowInvite(true)}
              style={{ padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#3B82F6,#14B8A6)', color: 'white', fontWeight: 600, fontSize: 14 }}
            >
              Invite Member
            </button>
          )}
        </div>

        {/* Usage bars */}
        <div style={{ background: '#141E35', border: '1px solid #1C2B45', borderRadius: 12, padding: 20, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ProgressBar value={members.length} max={maxMembers} label="Members" color="#3B82F6" />
          <ProgressBar value={currentStakeholders} max={maxStakeholders} label="Stakeholders" color="#14B8A6" />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={36} /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {members.map((m) => (
              <MemberCard
                key={m.id}
                member={m}
                canRemove={isAdmin}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}

        {/* Invitations */}
        <div style={{ marginTop: 36 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.92)', marginBottom: 16 }}>
            Pending Invitations
            {invitations.length > 0 && (
              <span style={{ marginLeft: 8, fontSize: 13, background: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 20, padding: '2px 10px' }}>
                {invitations.length}
              </span>
            )}
          </h2>
          <InvitationList invitations={invitations} onRefresh={load} />
        </div>
      </div>

      <InviteModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        onSuccess={load}
        limitReached={limitReached}
      />
    </div>
  )
}
