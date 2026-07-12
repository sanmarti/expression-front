import { useEffect, useState } from 'react'
import { adminGetOrgs, adminGetUsers, adminUpdateSubscription, adminDeleteOrg, adminGetStats } from '../api/subscriptions.js'
import { adminGetCockpitQuestions, adminCreateCockpitQuestion, adminUpdateCockpitQuestion, adminDeleteCockpitQuestion } from '../api/cockpit.js'
import { INDICATORS } from '../constants/avatars.js'
import Badge from '../components/ui/Badge.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { useToast } from '../components/ui/Toast.jsx'

const PLANS = ['free', 'starter', 'pro', 'enterprise']

function KpiCard({ label, value, sub, color = '#3B82F6', prefix = '', suffix = '' }) {
  return (
    <div style={{ background: '#141E35', border: '1px solid #1C2B45', borderRadius: 14, padding: '20px 24px' }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, color }}>{prefix}{value ?? '—'}{suffix}</div>
      {sub && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

function MiniBar({ label, value, max, color, revenue }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.70)' }}>{label}</span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)' }}>{value} orgs · ${revenue}/mo</span>
      </div>
      <div style={{ height: 6, background: '#0B1120', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.5s' }} />
      </div>
    </div>
  )
}

function SparkLine({ data, color }) {
  if (!data?.length) return <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)' }}>No data</span>
  const max = Math.max(...data.map((d) => parseInt(d.count)), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 40 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 4 }}>
          <div style={{
            width: '100%', background: color, borderRadius: 3,
            height: `${Math.max((parseInt(d.count) / max) * 36, 3)}px`,
            opacity: i === data.length - 1 ? 1 : 0.5,
          }} />
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.30)', whiteSpace: 'nowrap' }}>{d.month}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdminPage() {
  const toast = useToast()
  const [tab, setTab] = useState('dashboard')
  const [orgs, setOrgs] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [totals, setTotals] = useState({ orgs: 0, users: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [qLoading, setQLoading] = useState(false)
  const [showNewQ, setShowNewQ] = useState(false)
  const [newQ, setNewQ] = useState({ text: '', indicator: 'altitude', options: [
    { key: 'A', text: '', score: 100 },
    { key: 'B', text: '', score: 75 },
    { key: 'C', text: '', score: 50 },
    { key: 'D', text: '', score: 25 },
    { key: 'E', text: '', score: 0 },
  ]})
  const [savingQ, setSavingQ] = useState(false)

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
      adminGetStats().then(({ data }) => setStats(data)).catch(() => {}),
    ]).finally(() => setLoading(false))

    setQLoading(true)
    adminGetCockpitQuestions().then(({ data }) => setQuestions(data)).catch(() => {}).finally(() => setQLoading(false))
  }, [])

  const handlePlanChange = async (orgId, plan) => {
    try {
      await adminUpdateSubscription(orgId, plan)
      setOrgs((prev) => prev.map((o) => o.id === orgId ? { ...o, plan_name: plan } : o))
      toast('Plan updated', 'success')
    } catch {
      toast('Failed to update plan', 'error')
    }
  }

  const handleDeleteOrg = async (org) => {
    if (!window.confirm(`Delete "${org.name}"? This removes all members and cannot be undone.`)) return
    setDeletingId(org.id)
    try {
      await adminDeleteOrg(org.id)
      setOrgs((prev) => prev.filter((o) => o.id !== org.id))
      toast(`"${org.name}" deleted`, 'success')
    } catch {
      toast('Failed to delete organization', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const handleCreateQuestion = async () => {
    if (!newQ.text.trim()) { toast('Question text required', 'error'); return }
    if (newQ.options.some((o) => !o.text.trim())) { toast('Fill all 5 option texts', 'error'); return }
    setSavingQ(true)
    try {
      const { data } = await adminCreateCockpitQuestion({
        text: newQ.text, indicator: newQ.indicator, sort_order: questions.length,
        options: newQ.options.map((o) => ({ key: o.key, text: o.text, score: parseInt(o.score) })),
      })
      setQuestions((q) => [...q, data])
      setNewQ({ text: '', indicator: 'altitude', options: [
        { key: 'A', text: '', score: 100 }, { key: 'B', text: '', score: 75 },
        { key: 'C', text: '', score: 50 },  { key: 'D', text: '', score: 25 },
        { key: 'E', text: '', score: 0 },
      ]})
      setShowNewQ(false)
      toast('Question created', 'success')
    } catch { toast('Failed to create question', 'error') }
    finally { setSavingQ(false) }
  }

  const handleToggleActive = async (q) => {
    try {
      await adminUpdateCockpitQuestion(q.id, { is_active: !q.is_active })
      setQuestions((qs) => qs.map((x) => x.id === q.id ? { ...x, is_active: !q.is_active } : x))
    } catch { toast('Failed to update', 'error') }
  }

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Delete this question? User answers will also be removed.")) return
    try {
      await adminDeleteCockpitQuestion(id)
      setQuestions((qs) => qs.filter((q) => q.id !== id))
      toast('Question deleted', 'success')
    } catch { toast('Failed to delete', 'error') }
  }

  const tabStyle = (t) => ({
    padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer',
    fontSize: 14, fontWeight: 600,
    color: tab === t ? '#3B82F6' : 'rgba(255,255,255,0.50)',
    borderBottom: `2px solid ${tab === t ? '#3B82F6' : 'transparent'}`,
  })

  const cellStyle = { padding: '12px 16px', fontSize: 13, color: 'rgba(255,255,255,0.80)', borderBottom: '1px solid #1C2B45' }
  const thStyle = { padding: '10px 16px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.40)', background: '#0B1120', textAlign: 'left' }

  const maxOrgs = stats ? Math.max(...(stats.plan_distribution || []).map((p) => parseInt(p.orgs)), 1) : 1

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', padding: '24px 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header — no island button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'rgba(255,255,255,0.92)', margin: 0 }}>Admin Panel</h1>
          <Badge variant="red">Superadmin</Badge>
        </div>

        <div style={{ borderBottom: '1px solid #1C2B45', marginBottom: 24, display: 'flex' }}>
          {['dashboard', 'orgs', 'users', 'questionnaire'].map((t) => (
            <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
              {t === 'dashboard' ? 'Dashboard' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={36} /></div>
        ) : (
          <>
            {/* ── DASHBOARD ─────────────────────────────────────────── */}
            {tab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Row 1 — top KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                  <KpiCard label="Total Users" value={stats?.users?.total ?? totals.users} color="#3B82F6"
                    sub={`+${stats?.users?.this_month ?? 0} this month`} />
                  <KpiCard label="Total Orgs" value={stats?.orgs?.total ?? totals.orgs} color="#14B8A6"
                    sub={`${stats?.orgs?.active ?? 0} active`} />
                  <KpiCard label="MRR" value={stats?.revenue?.mrr != null ? stats.revenue.mrr.toLocaleString('en-US', { minimumFractionDigits: 0 }) : '—'} prefix="$" color="#10B981"
                    sub={stats?.revenue?.arr != null ? `$${stats.revenue.arr.toLocaleString()} ARR` : null} />
                  <KpiCard label="Total Stakeholders" value={stats?.stakeholders?.total ?? '—'} color="#F59E0B"
                    sub={stats?.orgs?.active ? `~${Math.round((stats?.stakeholders?.total ?? 0) / (stats?.orgs?.active || 1))} per org` : null} />
                </div>

                {/* Row 2 — growth + behaviour */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                  {/* User growth */}
                  <div style={{ background: '#141E35', border: '1px solid #1C2B45', borderRadius: 14, padding: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.70)', marginBottom: 16 }}>User Growth (6 months)</div>
                    <SparkLine data={stats?.user_growth} color="#3B82F6" />
                    <div style={{ marginTop: 16, display: 'flex', gap: 24 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginBottom: 4 }}>THIS MONTH</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#3B82F6' }}>{stats?.users?.this_month ?? '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginBottom: 4 }}>LAST MONTH</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.50)' }}>{stats?.users?.last_month ?? '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginBottom: 4 }}>MOM GROWTH</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: stats?.users?.growth_pct > 0 ? '#10B981' : '#EF4444' }}>
                          {stats?.users?.growth_pct != null ? `${stats.users.growth_pct > 0 ? '+' : ''}${stats.users.growth_pct}%` : '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Org growth */}
                  <div style={{ background: '#141E35', border: '1px solid #1C2B45', borderRadius: 14, padding: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.70)', marginBottom: 16 }}>Org Registrations (6 months)</div>
                    <SparkLine data={stats?.org_growth} color="#14B8A6" />
                    <div style={{ marginTop: 16, display: 'flex', gap: 24 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginBottom: 4 }}>TOTAL</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#14B8A6' }}>{stats?.orgs?.total ?? '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginBottom: 4 }}>ACTIVE</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#10B981' }}>{stats?.orgs?.active ?? '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginBottom: 4 }}>ACTIVATION</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.80)' }}>
                          {stats?.orgs?.total ? `${Math.round((stats.orgs.active / stats.orgs.total) * 100)}%` : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3 — revenue by plan */}
                <div style={{ background: '#141E35', border: '1px solid #1C2B45', borderRadius: 14, padding: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.70)', marginBottom: 20 }}>Revenue by Plan</div>
                  {stats?.plan_distribution?.length ? (
                    stats.plan_distribution.map((p, i) => (
                      <MiniBar
                        key={p.name}
                        label={p.name.charAt(0).toUpperCase() + p.name.slice(1)}
                        value={parseInt(p.orgs)}
                        max={maxOrgs}
                        revenue={parseFloat(p.revenue).toFixed(0)}
                        color={['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'][i % 4]}
                      />
                    ))
                  ) : (
                    <div style={{ color: 'rgba(255,255,255,0.30)', fontSize: 13 }}>No plan data yet</div>
                  )}
                </div>

                {/* Row 4 — behaviour */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                  <KpiCard label="ARR" value={stats?.revenue?.arr != null ? `$${stats.revenue.arr.toLocaleString()}` : '—'} color="#10B981"
                    sub="Annual Recurring Revenue" />
                  <KpiCard label="Avg Stakeholders / Org" color="#F59E0B"
                    value={stats?.orgs?.active ? Math.round((stats?.stakeholders?.total ?? 0) / (stats.orgs.active || 1)) : '—'}
                    sub="Measures platform depth of use" />
                  <KpiCard label="Paid Conversion"
                    value={stats?.plan_distribution
                      ? (() => {
                          const total = stats.plan_distribution.reduce((s, p) => s + parseInt(p.orgs), 0)
                          const paid = stats.plan_distribution.filter((p) => p.name !== 'free').reduce((s, p) => s + parseInt(p.orgs), 0)
                          return total > 0 ? `${Math.round((paid / total) * 100)}%` : '—'
                        })()
                      : '—'}
                    color="#8B5CF6"
                    sub="Orgs on a paid plan" />
                </div>
              </div>
            )}

            {/* ── ORGS ──────────────────────────────────────────────── */}
            {tab === 'orgs' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#141E35', borderRadius: 12, overflow: 'hidden' }}>
                <thead>
                  <tr>
                    {['Name', 'Owner', 'Plan', 'Members', 'Status', 'Change Plan', ''].map((h) => (
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
                      <td style={cellStyle}>
                        <button
                          onClick={() => handleDeleteOrg(org)}
                          disabled={deletingId === org.id}
                          style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #EF4444', background: 'transparent', color: '#EF4444', fontSize: 12, cursor: 'pointer', opacity: deletingId === org.id ? 0.5 : 1 }}
                        >
                          {deletingId === org.id ? '…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* ── USERS ─────────────────────────────────────────────── */}
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
                      {['Name', 'Email', 'Role', 'Organization', 'Joined'].map((h) => (
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

            {/* ── QUESTIONNAIRE ─────────────────────────────────────── */}
            {tab === 'questionnaire' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>{questions.length} questions</div>
                  <button
                    onClick={() => setShowNewQ((v) => !v)}
                    style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#3B82F6', color: 'white', fontWeight: 600, fontSize: 13 }}
                  >
                    {showNewQ ? 'Cancel' : '+ New question'}
                  </button>
                </div>

                {/* Create form */}
                {showNewQ && (
                  <div style={{ background: '#141E35', border: '1px solid #3B82F6', borderRadius: 12, padding: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.92)', marginBottom: 16 }}>New Question</div>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', marginBottom: 6 }}>Question text</div>
                        <input
                          value={newQ.text}
                          onChange={(e) => setNewQ((q) => ({ ...q, text: e.target.value }))}
                          placeholder="How would you describe your current energy level?"
                          style={{ width: '100%', padding: '9px 12px', borderRadius: 7, background: '#0B1120', border: '1px solid #1C2B45', color: 'rgba(255,255,255,0.90)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', marginBottom: 6 }}>Indicator</div>
                        <select
                          value={newQ.indicator}
                          onChange={(e) => setNewQ((q) => ({ ...q, indicator: e.target.value }))}
                          style={{ padding: '9px 12px', borderRadius: 7, background: '#0B1120', border: '1px solid #1C2B45', color: 'rgba(255,255,255,0.90)', fontSize: 13 }}
                        >
                          {INDICATORS.map((i) => <option key={i.id} value={i.id}>{i.icon} {i.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                      {newQ.options.map((opt, idx) => (
                        <div key={opt.key} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <span style={{ width: 20, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.40)', flexShrink: 0 }}>{opt.key}</span>
                          <input
                            value={opt.text}
                            onChange={(e) => setNewQ((q) => ({ ...q, options: q.options.map((o, i) => i === idx ? { ...o, text: e.target.value } : o) }))}
                            placeholder={`Option ${opt.key} text`}
                            style={{ flex: 1, padding: '7px 10px', borderRadius: 6, background: '#0B1120', border: '1px solid #1C2B45', color: 'rgba(255,255,255,0.85)', fontSize: 13, outline: 'none' }}
                          />
                          <input
                            type="number" min="0" max="100"
                            value={opt.score}
                            onChange={(e) => setNewQ((q) => ({ ...q, options: q.options.map((o, i) => i === idx ? { ...o, score: e.target.value } : o) }))}
                            style={{ width: 60, padding: '7px 8px', borderRadius: 6, background: '#0B1120', border: '1px solid #1C2B45', color: 'rgba(255,255,255,0.70)', fontSize: 13, outline: 'none', textAlign: 'center' }}
                          />
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>pts</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleCreateQuestion}
                      disabled={savingQ}
                      style={{ padding: '9px 22px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#3B82F6,#14B8A6)', color: 'white', fontWeight: 600, fontSize: 13, opacity: savingQ ? 0.6 : 1 }}
                    >
                      {savingQ ? 'Saving…' : 'Create question'}
                    </button>
                  </div>
                )}

                {/* Questions list */}
                {qLoading ? (
                  <div style={{ textAlign: 'center', padding: 32, color: 'rgba(255,255,255,0.30)' }}>Loading…</div>
                ) : questions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 48, color: 'rgba(255,255,255,0.25)' }}>No questions yet. Create one above.</div>
                ) : (
                  questions.map((q) => {
                    const ind = INDICATORS.find((i) => i.id === q.indicator)
                    return (
                      <div key={q.id} style={{ background: '#141E35', border: `1px solid ${q.is_active ? '#1C2B45' : 'rgba(239,68,68,0.20)'}`, borderRadius: 12, padding: '18px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 6, lineHeight: 1.5 }}>{q.text}</div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: ind?.color || '#3B82F6' }}>{ind?.icon} {ind?.label || q.indicator}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                            <button
                              onClick={() => handleToggleActive(q)}
                              style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${q.is_active ? '#10B981' : '#EF4444'}`, background: 'transparent', color: q.is_active ? '#10B981' : '#EF4444', fontSize: 12, cursor: 'pointer' }}
                            >
                              {q.is_active ? 'Active' : 'Inactive'}
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.30)', background: 'transparent', color: '#EF4444', fontSize: 12, cursor: 'pointer' }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {(q.options || []).map((o) => (
                            <div key={o.key} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 6, background: '#0B1120', border: '1px solid #1C2B45', color: 'rgba(255,255,255,0.55)' }}>
                              <strong style={{ color: ind?.color || '#3B82F6' }}>{o.key}</strong> {o.text} <span style={{ color: 'rgba(255,255,255,0.30)' }}>({o.score}pts)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
