import { useEffect, useState } from 'react'
import { getMembers, getInvitations, removeMember } from '../api/members.js'
import { getSubscription } from '../api/subscriptions.js'
import MemberCard from '../components/members/MemberCard.jsx'
import InviteModal from '../components/members/InviteModal.jsx'
import InvitationList from '../components/members/InvitationList.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useOrganization } from '../hooks/useOrganization.js'
import useAuthStore from '../store/authStore.js'
import { useNavigate } from 'react-router-dom'

// Placeholder members shown until real users are invited
const DEMO_MEMBERS = [
  {
    id: 'demo-1',
    display_name: 'Carlos Mendez',
    email: 'carlos.mendez@cocacola.com',
    role: 'member',
    selected_avatar: 'pilot_5',
    joined_at: '2025-03-10',
    cockpit: { altitude: 82, fuel: 74, visibility: 88, speed: 65 },
  },
  {
    id: 'demo-2',
    display_name: 'Sofia Ruiz',
    email: 'sofia.ruiz@cocacola.com',
    role: 'viewer',
    selected_avatar: 'pilot_18',
    joined_at: '2025-04-22',
    cockpit: { altitude: 55, fuel: 48, visibility: 70, speed: 60 },
  },
]

export default function MembersPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { isAdmin } = useOrganization()
  const org = useAuthStore((s) => s.org)
  const [members, setMembers] = useState([])
  const [invitations, setInvitations] = useState([])
  const [planData, setPlanData] = useState(null)
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
    try {
      const sub = await getSubscription()
      setPlanData(sub.data)
    } catch {}
  }

  useEffect(() => { load() }, [])

  const handleRemove = async (id) => {
    if (!confirm('Remove this member?')) return
    try {
      await removeMember(id)
      await load()
      toast('Member removed', 'info')
    } catch {
      toast('Failed to remove', 'error')
    }
  }

  const maxMembers = planData?.limits?.max_members ?? 3
  const maxStakeholders = planData?.limits?.max_stakeholders ?? 5
  const currentMembers = planData?.usage?.members ?? members.length
  const currentStakeholders = planData?.usage?.stakeholders ?? 0
  const limitReached = currentMembers >= maxMembers

  // Merge real members with demo placeholders (demo shown only when fewer than 2 real members)
  const displayMembers = [
    ...members,
    ...(members.length < 2 ? DEMO_MEMBERS.slice(0, 2 - members.length) : []),
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', padding: '24px 32px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Header */}
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
              + Invite Member
            </button>
          )}
        </div>

        {/* Usage bars */}
        <div style={{ background: '#141E35', border: '1px solid #1C2B45', borderRadius: 14, padding: '20px 24px', marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ProgressBar value={currentMembers} max={maxMembers} label="Members" color="#3B82F6" />
          <ProgressBar value={currentStakeholders} max={maxStakeholders} label="Stakeholders" color="#14B8A6" />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={40} /></div>
        ) : (
          <>
            {/* Member cards grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
              marginBottom: 48,
            }}>
              {displayMembers.map((m) => (
                <MemberCard
                  key={m.id}
                  member={m}
                  canRemove={isAdmin}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {/* Pending invitations */}
            {(isAdmin || invitations.length > 0) && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                  Pending Invitations
                  {invitations.length > 0 && (
                    <span style={{ fontSize: 12, background: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.30)', borderRadius: 20, padding: '2px 10px', fontWeight: 700 }}>
                      {invitations.length}
                    </span>
                  )}
                </h2>
                <InvitationList invitations={invitations} onRefresh={load} />
              </div>
            )}
          </>
        )}
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
