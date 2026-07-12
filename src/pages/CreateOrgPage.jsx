import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrg } from '../api/organizations.js'
import useAuthStore from '../store/authStore.js'
import { useToast } from '../components/ui/Toast.jsx'

const PLANS = [
  { id: 'free',       label: 'Free',       price: '$0',   members: 3,   stakeholders: 5 },
  { id: 'starter',   label: 'Starter',    price: '$29',  members: 10,  stakeholders: 20 },
  { id: 'pro',       label: 'Pro',        price: '$99',  members: 50,  stakeholders: 100 },
  { id: 'enterprise',label: 'Enterprise', price: '$299', members: '∞', stakeholders: '∞' },
]

export default function CreateOrgPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const setOrg = useAuthStore((s) => s.setOrg)
  const [form, setForm] = useState({ name: '', description: '', plan: 'free' })
  const [loading, setLoading] = useState(false)

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 8, marginTop: 6,
    background: '#0B1120', border: '1px solid #1C2B45',
    color: 'rgba(255,255,255,0.92)', fontSize: 14, outline: 'none', display: 'block',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await createOrg(form)
      // API may return { org: {...} } or the org object directly
      const org = data.org ?? data
      const role = data.role ?? data.org_role ?? 'admin'
      setOrg(org, role)
      navigate('/island')
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to create organization', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 600 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 80, lineHeight: 1 }}>🏝️</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'rgba(255,255,255,0.92)', marginTop: 16 }}>
            Create your organization
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', marginTop: 8 }}>
            This will be your island headquarters
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#141E35', border: '1px solid #1C2B45', borderRadius: 16, padding: 40, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Organization name *</label>
            <input
              style={inputStyle}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required placeholder="Acme Corp"
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Description</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of your organization..."
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: 12 }}>
              Choose your plan
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, plan: plan.id }))}
                  style={{
                    padding: '16px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                    background: form.plan === plan.id ? '#1C2B45' : '#0B1120',
                    border: `1px solid ${form.plan === plan.id ? '#3B82F6' : '#1C2B45'}`,
                    color: 'rgba(255,255,255,0.92)',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>{plan.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#3B82F6' }}>{plan.price}<span style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', fontWeight: 400 }}>/mes</span></div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', marginTop: 6 }}>
                    {plan.members} members · {plan.stakeholders} stakeholders
                  </div>
                </button>
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)', marginTop: 10 }}>
              All plans start free. Payment coming soon.
            </p>
          </div>

          <button type="submit" disabled={loading} style={{
            height: 50, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: 'linear-gradient(135deg,#3B82F6,#14B8A6)',
            color: 'white', fontWeight: 700, fontSize: 16, opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Creating…' : 'Create & Enter Island 🚩'}
          </button>
        </form>
      </div>
    </div>
  )
}
