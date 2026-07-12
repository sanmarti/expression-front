import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminGetOrgs, adminGetUsers, adminUpdateSubscription } from '../api/subscriptions.js'
import Badge from '../components/ui/Badge.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { useToast } from '../components/ui/Toast.jsx'

const PLANS = ['free','starter','pro','enterprise']

export default function AdminPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [tab, setTab] = useState('orgs')
  const [orgs, setOrgs] = useState([])
  const [users, setUsers] = useState([])
  const [totals, setTotals] = useState({ orgs: 0, users: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      adminGetOrgs().then(({ data }) => {
        setOrgs(data.organizations || [])
        setTotals((t) => ({ ...t, orgs: data.total || 0 }))
      }),
      adminGetUsers().then(({ data }) => {
        setUsers(data.users || [])
        setTotals((t) => ({ ...t, users: data.total || 0 }))
      }),
    ]).finally(() => setLoading(false))
  }, [])

  const handlePlanChange = async (orgId, plan) => {
    try {
      await adminUpdateSubscription(orgId, plan)
      setOrgs((prev) => prev.map((o) => o.id === orgId ? { ...o, plan } : o))
      toast('Plan updated', 'success')
    } catch {
      toast('Failed to update plan', 'error')
    }
  }

  const tabStyle = (t) => ({
    padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer',
    fontSize: 14, fontWeight: 600,
    color: tab === t ? '#3B82F6' : 'rgba(255,255,255,0.50)',
    borderBottom: `2px solid ${tab === t ? '#3B82F6' : 'transparent'}`,
  })

  const cellStyle = { padding: '12px 16px', fontSize: 13, color: 'rgba(255,255,255,0.80)', borderBottom: '1px solid #1C2B45' }
  const thStyle = { padding: '10px 16px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.40)', background: '#0B1120', textAlign: 'left' }

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', padding: '24px 32px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <button onClick={() => navigate('/island')} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: 14, padding: 0 }}>← Island</button>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'rgba(255,255,255,0.92)', margin: 0 }}>Admin Panel</h1>
          <Badge variant="red">Superadmin</Badge>
        </div>

        <div style={{ borderBottom: '1px solid #1C2B45', marginBottom: 24, display: 'flex' }}>
          {['orgs','users','stats'].map((t) => (
            <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={36} /></div>
        ) : (
          <>
            {tab === 'orgs' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#141E35', borderRadius: 12, overflow: 'hidden' }}>
                <thead>
                  <tr>
                    {['Name','Owner','Plan','Members','Status','Actions'].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orgs.map((org) => (
                    <tr key={org.id}>
                      <td style={cellStyle}>{org.name}</td>
                      <td style={cellStyle}>{org.owner_email}</td>
                      <td style={cellStyle}><Badge variant="blue">{org.plan_name}</Badge></td>
                      <td style={cellStyle}>{org.member_count}</td>
                      <td style={cellStyle}><Badge variant={org.status === 'active' ? 'green' : 'gray'}>{org.status}</Badge></td>
                      <td style={cellStyle}>
                        <select
                          value={org.plan_name}
                          onChange={(e) => handlePlanChange(org.id, e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: 6, background: '#0B1120', border: '1px solid #1C2B45', color: 'rgba(255,255,255,0.80)', fontSize: 12 }}
                        >
                          {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'users' && (
              <>
                <input
                  placeholder="Search by email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#141E35', border: '1px solid #1C2B45', color: 'rgba(255,255,255,0.92)', fontSize: 14, outline: 'none', marginBottom: 16 }}
                />
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#141E35', borderRadius: 12, overflow: 'hidden' }}>
                  <thead>
                    <tr>
                      {['Name','Email','Role','Organization','Joined'].map((h) => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter((u) => !search || u.email.includes(search)).map((u) => (
                      <tr key={u.id}>
                        <td style={cellStyle}>{u.display_name}</td>
                        <td style={cellStyle}>{u.email}</td>
                        <td style={cellStyle}><Badge variant={u.role === 'superadmin' ? 'red' : 'gray'}>{u.role}</Badge></td>
                        <td style={cellStyle}>{u.org_name || '—'}</td>
                        <td style={cellStyle}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {tab === 'stats' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                {[
                  { label: 'Total Users', value: totals.users, color: '#3B82F6' },
                  { label: 'Total Orgs', value: totals.orgs, color: '#14B8A6' },
                  { label: 'Active Orgs', value: orgs.filter((o) => o.status === 'active').length, color: '#10B981' },
                  { label: 'Plans loaded', value: orgs.length, color: '#F59E0B' },
                ].map((kpi) => (
                  <div key={kpi.label} style={{ background: '#141E35', border: '1px solid #1C2B45', borderRadius: 14, padding: 24 }}>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: kpi.color }}>{kpi.value ?? '—'}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
