import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'
import Badge from '../components/ui/Badge.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import { useToast } from '../components/ui/Toast.jsx'

const PLANS = [
  {
    id: 'free', label: 'Free', price: '$0', members: 3, stakeholders: 5,
    features: ['3 team members', '5 stakeholders', 'Basic climate tracking', 'Island map'],
  },
  {
    id: 'starter', label: 'Starter', price: '$29', members: 10, stakeholders: 20,
    features: ['10 team members', '20 stakeholders', 'Full climate system', 'History & trends', 'Email invites'],
  },
  {
    id: 'pro', label: 'Pro', price: '$99', members: 50, stakeholders: 100,
    features: ['50 team members', '100 stakeholders', 'API integrations', 'Advanced analytics', 'Priority support'],
  },
  {
    id: 'enterprise', label: 'Enterprise', price: '$299', members: '∞', stakeholders: '∞',
    features: ['Unlimited members', 'Unlimited stakeholders', 'SSO', 'Custom integrations', 'Dedicated support'],
  },
]

export default function SubscriptionPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const org = useAuthStore((s) => s.org)
  const currentPlan = org?.subscription?.plan || 'free'
  const maxMembers = org?.subscription?.max_members || 3
  const maxStakeholders = org?.subscription?.max_stakeholders || 5
  const currentMembers = org?.member_count || 0
  const currentStakeholders = org?.stakeholder_count || 0

  const handleUpgrade = (planId) => {
    if (planId === currentPlan) return
    const current = PLANS.findIndex((p) => p.id === currentPlan)
    const target = PLANS.findIndex((p) => p.id === planId)
    if (target > current) toast('Upgrade coming soon!', 'info')
    else toast('Contact us to downgrade: hello@expression.app', 'info')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', padding: '24px 32px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <button onClick={() => navigate('/island')} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: 14, padding: 0 }}>
            ← Island
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'rgba(255,255,255,0.92)', margin: 0 }}>Your Plan</h1>
          <Badge variant="teal" style={{ textTransform: 'capitalize' }}>{currentPlan}</Badge>
        </div>

        {/* Usage */}
        <div style={{ background: '#141E35', border: '1px solid #1C2B45', borderRadius: 12, padding: 24, marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.92)', margin: 0 }}>Current Usage</h2>
          <ProgressBar value={currentMembers} max={maxMembers} label="Members" color="#3B82F6" />
          <ProgressBar value={currentStakeholders} max={maxStakeholders} label="Stakeholders" color="#14B8A6" />
        </div>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan
            const isUpgrade = PLANS.findIndex((p) => p.id === plan.id) > PLANS.findIndex((p) => p.id === currentPlan)
            return (
              <div key={plan.id} style={{
                background: isCurrent ? '#1C2B45' : '#141E35',
                border: `1px solid ${isCurrent ? '#10B981' : '#1C2B45'}`,
                borderRadius: 14, padding: 24,
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>{plan.label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#3B82F6' }}>
                  {plan.price}<span style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', fontWeight: 400 }}>/mo</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ fontSize: 13, color: 'rgba(255,255,255,0.70)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#10B981' }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)' }}>
                  {plan.members} members · {plan.stakeholders} stakeholders
                </div>
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent}
                  style={{
                    padding: '10px', borderRadius: 8, border: 'none', cursor: isCurrent ? 'default' : 'pointer',
                    background: isCurrent ? 'rgba(16,185,129,0.15)' : isUpgrade ? '#3B82F6' : '#374151',
                    color: isCurrent ? '#10B981' : 'white', fontWeight: 600, fontSize: 13,
                  }}
                >
                  {isCurrent ? 'Current Plan' : isUpgrade ? 'Upgrade' : 'Downgrade'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
