import { useEffect, useState } from 'react'
import { adminGetOrgs, adminGetUsers, adminUpdateSubscription, adminDeleteOrg, adminGetStats } from '../api/subscriptions.js'
import { adminGetGroups, adminCreateGroup, adminUpdateGroup, adminDeleteGroup, adminAddQuestionToGroup, adminUpdateCockpitQuestion, adminDeleteCockpitQuestion } from '../api/cockpit.js'
import { getStatusRules, updateStatusRules } from '../api/climate.js'
import { INDICATORS } from '../constants/avatars.js'
import Badge from '../components/ui/Badge.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import useAuthStore from '../store/authStore.js'

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
  const { logout } = useAuthStore()
  const [tab, setTab] = useState('dashboard')
  const [orgs, setOrgs] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [totals, setTotals] = useState({ orgs: 0, users: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [groups, setGroups] = useState([])
  const [gLoading, setGLoading] = useState(false)
  const [expandedGroup, setExpandedGroup] = useState(null)
  const [newGroupTitle, setNewGroupTitle] = useState('')
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [savingGroup, setSavingGroup] = useState(false)
  const [addingQToGroup, setAddingQToGroup] = useState(null)
  const [newQ, setNewQ] = useState({ text: '', indicator: 'altitude', options: [
    { key: 'A', text: '', score: 100 },
    { key: 'B', text: '', score: 75 },
    { key: 'C', text: '', score: 50 },
    { key: 'D', text: '', score: 25 },
    { key: 'E', text: '', score: 0 },
  ]})
  const [savingQ, setSavingQ] = useState(false)
  const [editingQ, setEditingQ] = useState(null)

  const [statusRules, setStatusRules] = useState([])
  const [statusThresholds, setStatusThresholds] = useState({ favorable_min: 70, attention_min: 40 })
  const [rulesLoading, setRulesLoading] = useState(false)
  const [savingRules, setSavingRules] = useState(false)

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

    setGLoading(true)
    adminGetGroups().then(({ data }) => setGroups(data)).catch(() => {}).finally(() => setGLoading(false))
  }, [])

  const loadStatusRules = () => {
    if (statusRules.length > 0) return
    setRulesLoading(true)
    getStatusRules()
      .then(({ data }) => { setStatusRules(data.rules || []); setStatusThresholds(data.thresholds || { favorable_min: 70, attention_min: 40 }) })
      .catch(() => toast('Failed to load status rules', 'error'))
      .finally(() => setRulesLoading(false))
  }

  const handleSaveRules = async () => {
    setSavingRules(true)
    try {
      await updateStatusRules({ rules: statusRules, thresholds: statusThresholds })
      toast('Status rules saved', 'success')
    } catch {
      toast('Failed to save rules', 'error')
    } finally {
      setSavingRules(false)
    }
  }

  const setRuleScore = (indicator, value, score) => {
    setStatusRules((prev) => prev.map((r) =>
      r.indicator === indicator && r.value === value ? { ...r, score: parseInt(score, 10) } : r
    ))
  }

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

  const blankQ = () => ({
    text: '', indicator: 'altitude', options: [
      { key: 'A', text: '', score: 100 }, { key: 'B', text: '', score: 75 },
      { key: 'C', text: '', score: 50 },  { key: 'D', text: '', score: 25 },
      { key: 'E', text: '', score: 0 },
    ]
  })

  const handleCreateGroup = async () => {
    if (!newGroupTitle.trim()) { toast('Group title required', 'error'); return }
    setSavingGroup(true)
    try {
      const { data } = await adminCreateGroup({ title: newGroupTitle.trim() })
      setGroups((g) => [...g, data])
      setNewGroupTitle('')
      setShowNewGroup(false)
      toast('Group created', 'success')
    } catch { toast('Failed to create group', 'error') }
    finally { setSavingGroup(false) }
  }

  const handleToggleGroupStatus = async (group) => {
    const newStatus = group.status === 'published' ? 'draft' : 'published'
    try {
      await adminUpdateGroup(group.id, { status: newStatus })
      setGroups((gs) => gs.map((g) => g.id === group.id ? { ...g, status: newStatus } : g))
      toast(`Group ${newStatus}`, 'success')
    } catch { toast('Failed to update group', 'error') }
  }

  const handleDeleteGroup = async (group) => {
    if (!window.confirm(`Delete "${group.title}"? All questions inside will be removed.`)) return
    try {
      await adminDeleteGroup(group.id)
      setGroups((gs) => gs.filter((g) => g.id !== group.id))
      toast('Group deleted', 'success')
    } catch { toast('Failed to delete group', 'error') }
  }

  const handleAddQuestion = async (groupId) => {
    if (!newQ.text.trim()) { toast('Question text required', 'error'); return }
    if (newQ.options.some((o) => !o.text.trim())) { toast('Fill all 5 option texts', 'error'); return }
    setSavingQ(true)
    try {
      const group = groups.find((g) => g.id === groupId)
      const { data } = await adminAddQuestionToGroup(groupId, {
        text: newQ.text, indicator: newQ.indicator,
        sort_order: group?.questions?.length ?? 0,
        options: newQ.options.map((o) => ({ key: o.key, text: o.text, score: parseInt(o.score) })),
      })
      setGroups((gs) => gs.map((g) => g.id === groupId ? { ...g, questions: [...g.questions, data] } : g))
      setNewQ(blankQ())
      setAddingQToGroup(null)
      toast('Question added', 'success')
    } catch { toast('Failed to add question', 'error') }
    finally { setSavingQ(false) }
  }

  const handleSaveQuestion = async (groupId, q) => {
    try {
      const { data } = await adminUpdateCockpitQuestion(q.id, {
        text: q.text, indicator: q.indicator,
        options: q.options.map((o) => ({ id: o.id, text: o.text, score: parseInt(o.score) })),
      })
      setGroups((gs) => gs.map((g) => g.id === groupId
        ? { ...g, questions: g.questions.map((x) => x.id === q.id ? { ...data, options: data.options?.map((o) => ({ id: o.option_id ?? o.id, key: o.option_key ?? o.key, text: o.option_text ?? o.text, score: o.score })) ?? q.options } : x) }
        : g
      ))
      setEditingQ(null)
      toast('Question saved', 'success')
    } catch { toast('Failed to save question', 'error') }
  }

  const handleDeleteQuestion = async (groupId, questionId) => {
    if (!window.confirm('Delete this question?')) return
    try {
      await adminDeleteCockpitQuestion(questionId)
      setGroups((gs) => gs.map((g) => g.id === groupId
        ? { ...g, questions: g.questions.filter((q) => q.id !== questionId) }
        : g
      ))
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
          <button
            onClick={logout}
            style={{ marginLeft: 'auto', padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.35)', background: 'transparent', color: '#EF4444', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
          >
            Log out
          </button>
        </div>

        <div style={{ borderBottom: '1px solid #1C2B45', marginBottom: 24, display: 'flex' }}>
          {[
            ['dashboard', 'Dashboard'],
            ['orgs', 'Orgs'],
            ['users', 'Users'],
            ['questionnaire', 'Questionnaire'],
            ['status-rules', 'Status Rules'],
          ].map(([t, label]) => (
            <button key={t} style={tabStyle(t)} onClick={() => { setTab(t); if (t === 'status-rules') loadStatusRules() }}>
              {label}
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

            {/* ── STATUS RULES ──────────────────────────────────────── */}
            {tab === 'status-rules' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', lineHeight: 1.6 }}>
                  Each indicator value gets a score from 0 (worst) to 100 (best). The average of all 6 scores
                  determines the overall status. Set the thresholds below to control when a camp becomes
                  Favorable, Attention, or Critical.
                </div>

                {rulesLoading ? (
                  <div style={{ textAlign: 'center', padding: 32 }}><Spinner size={32} /></div>
                ) : (
                  <>
                    {/* Thresholds */}
                    <div style={{ background: '#141E35', border: '1px solid #1C2B45', borderRadius: 12, padding: 24 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 16 }}>Score Thresholds</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {[
                          { key: 'favorable_min', label: 'Favorable when score ≥', color: '#22c55e' },
                          { key: 'attention_min',  label: 'Attention when score ≥', color: '#f59e0b' },
                        ].map(({ key, label, color }) => (
                          <div key={key}>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', marginBottom: 6 }}>{label}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <input
                                type="range" min="0" max="100"
                                value={statusThresholds[key]}
                                onChange={(e) => setStatusThresholds((t) => ({ ...t, [key]: parseInt(e.target.value, 10) }))}
                                style={{ flex: 1, accentColor: color }}
                              />
                              <span style={{ fontSize: 16, fontWeight: 700, color, minWidth: 36, textAlign: 'right' }}>
                                {statusThresholds[key]}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.30)' }}>
                        Critical when score &lt; {statusThresholds.attention_min} · Attention {statusThresholds.attention_min}–{statusThresholds.favorable_min - 1} · Favorable ≥ {statusThresholds.favorable_min}
                      </div>
                    </div>

                    {/* Indicator score cards */}
                    {[
                      { indicator: 'storm',       label: 'Turbulence · Risk & Conflict',        values: ['clear','cloudy','rainy','stormy'],        icons: { clear:'🟢', cloudy:'🟡', rainy:'🟠', stormy:'🔴' } },
                      { indicator: 'uv_index',    label: 'Sky Conditions · Alignment & Support', values: ['optimal','favorable','neutral','blocked'], icons: { optimal:'☀️', favorable:'🌤️', neutral:'☁️', blocked:'⛈️' } },
                      { indicator: 'visibility',  label: 'Visibility · Information Quality',     values: ['clear','partial','misty','foggy'],        icons: { clear:'🧭', partial:'👀', misty:'🌁', foggy:'🌫️' } },
                      { indicator: 'wind',        label: 'Wind Strength · Influence & Power',    values: ['calm','breeze','windy','gale'],            icons: { calm:'🌈', breeze:'🌬️', windy:'💨', gale:'🌪️' } },
                      { indicator: 'temperature', label: 'Temperature · Activity Level',         values: ['warm','temperate','hot','cold'],           icons: { warm:'🌡️', temperate:'🍃', hot:'🔥', cold:'❄️' } },
                      { indicator: 'tide',        label: 'Pressure Systems · Trend & Momentum',  values: ['high','stable','surge','low'],             icons: { high:'📈', stable:'➖', surge:'🌀', low:'📉' } },
                    ].map(({ indicator, label, values, icons }) => (
                      <div key={indicator} style={{ background: '#141E35', border: '1px solid #1C2B45', borderRadius: 12, padding: 20 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.80)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                          {values.map((val) => {
                            const rule = statusRules.find((r) => r.indicator === indicator && r.value === val)
                            const score = rule?.score ?? 50
                            const statusColor = score >= statusThresholds.favorable_min ? '#22c55e' : score >= statusThresholds.attention_min ? '#f59e0b' : '#ef4444'
                            return (
                              <div key={val} style={{ background: '#0B1120', borderRadius: 10, padding: '12px 14px', border: `1px solid ${statusColor}33` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                  <span style={{ fontSize: 18 }}>{icons[val]}</span>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)', textTransform: 'capitalize' }}>{val.replace('_', ' ')}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <input
                                    type="range" min="0" max="100"
                                    value={score}
                                    onChange={(e) => setRuleScore(indicator, val, e.target.value)}
                                    style={{ flex: 1, accentColor: statusColor }}
                                  />
                                  <span style={{ fontSize: 14, fontWeight: 700, color: statusColor, minWidth: 28, textAlign: 'right' }}>{score}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={handleSaveRules}
                      disabled={savingRules}
                      style={{
                        alignSelf: 'flex-start', padding: '11px 28px', borderRadius: 8, border: 'none',
                        background: 'linear-gradient(135deg,#3B82F6,#14B8A6)',
                        color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                        opacity: savingRules ? 0.6 : 1,
                      }}
                    >
                      {savingRules ? 'Saving…' : 'Save Rules'}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ── QUESTIONNAIRE ─────────────────────────────────────── */}
            {tab === 'questionnaire' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)' }}>
                    {groups.length} group{groups.length !== 1 ? 's' : ''} · {groups.reduce((s, g) => s + g.questions.length, 0)} questions
                  </div>
                  <button
                    onClick={() => { setShowNewGroup((v) => !v); setNewGroupTitle('') }}
                    style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#3B82F6', color: 'white', fontWeight: 600, fontSize: 13 }}
                  >
                    {showNewGroup ? 'Cancel' : '+ New Group'}
                  </button>
                </div>

                {/* New group form */}
                {showNewGroup && (
                  <div style={{ background: '#141E35', border: '1px solid #3B82F6', borderRadius: 12, padding: 20, display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', marginBottom: 6 }}>Group title</div>
                      <input
                        value={newGroupTitle}
                        onChange={(e) => setNewGroupTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
                        placeholder="e.g. Onboarding, Monthly Check-in…"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 7, background: '#0B1120', border: '1px solid #1C2B45', color: 'rgba(255,255,255,0.90)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <button
                      onClick={handleCreateGroup} disabled={savingGroup}
                      style={{ padding: '9px 22px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#3B82F6,#14B8A6)', color: 'white', fontWeight: 600, fontSize: 13, opacity: savingGroup ? 0.6 : 1, whiteSpace: 'nowrap' }}
                    >
                      {savingGroup ? 'Creating…' : 'Create Group'}
                    </button>
                  </div>
                )}

                {/* Groups list */}
                {gLoading ? (
                  <div style={{ textAlign: 'center', padding: 48 }}><Spinner size={32} /></div>
                ) : groups.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 48, color: 'rgba(255,255,255,0.25)' }}>No groups yet. Create one above.</div>
                ) : groups.map((group) => {
                  const isExpanded = expandedGroup === group.id
                  const isPublished = group.status === 'published'
                  return (
                    <div key={group.id} style={{ background: '#141E35', border: `1px solid ${isPublished ? 'rgba(16,185,129,0.30)' : '#1C2B45'}`, borderRadius: 14 }}>

                      {/* Group header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', cursor: 'pointer' }} onClick={() => setExpandedGroup(isExpanded ? null : group.id)}>
                        <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.30)', userSelect: 'none', transition: 'transform 0.15s', display: 'inline-block', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>{group.title}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{group.questions.length} question{group.questions.length !== 1 ? 's' : ''}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggleGroupStatus(group)}
                            style={{
                              padding: '5px 14px', borderRadius: 20, border: `1px solid ${isPublished ? '#10B981' : 'rgba(255,255,255,0.20)'}`,
                              background: isPublished ? 'rgba(16,185,129,0.12)' : 'transparent',
                              color: isPublished ? '#10B981' : 'rgba(255,255,255,0.45)',
                              fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em',
                            }}
                          >
                            {isPublished ? '● PUBLISHED' : '○ DRAFT'}
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group)}
                            style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.30)', background: 'transparent', color: '#EF4444', fontSize: 12, cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Group body — questions */}
                      {isExpanded && (
                        <div style={{ borderTop: '1px solid #1C2B45', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {group.questions.length === 0 && (
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '12px 0' }}>No questions yet.</div>
                          )}

                          {group.questions.map((q) => {
                            const ind = INDICATORS.find((i) => i.id === q.indicator)
                            const isEditing = editingQ?.id === q.id
                            const eq = isEditing ? editingQ : q
                            return (
                              <div key={q.id} style={{ background: '#0D1528', border: `1px solid ${isEditing ? '#3B82F6' : '#1C2B45'}`, borderRadius: 10, padding: '14px 16px' }}>
                                <div style={{ display: 'flex', gap: 12, marginBottom: isEditing ? 12 : 8 }}>
                                  <div style={{ flex: 1 }}>
                                    {isEditing ? (
                                      <input
                                        value={eq.text}
                                        onChange={(e) => setEditingQ((x) => ({ ...x, text: e.target.value }))}
                                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: '#060a16', border: '1px solid #3B82F6', color: 'rgba(255,255,255,0.90)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                                      />
                                    ) : (
                                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{q.text}</div>
                                    )}
                                  </div>
                                  {isEditing ? (
                                    <select
                                      value={eq.indicator}
                                      onChange={(e) => setEditingQ((x) => ({ ...x, indicator: e.target.value }))}
                                      style={{ padding: '6px 10px', borderRadius: 6, background: '#060a16', border: '1px solid #3B82F6', color: 'rgba(255,255,255,0.90)', fontSize: 12 }}
                                    >
                                      {INDICATORS.map((i) => <option key={i.id} value={i.id}>{i.icon} {i.label}</option>)}
                                    </select>
                                  ) : (
                                    <span style={{ fontSize: 11, fontWeight: 700, color: ind?.color || '#3B82F6', whiteSpace: 'nowrap', alignSelf: 'center' }}>{ind?.icon} {ind?.label}</span>
                                  )}
                                  <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignSelf: 'flex-start' }}>
                                    {isEditing ? (
                                      <>
                                        <button onClick={() => handleSaveQuestion(group.id, eq)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: '#3B82F6', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Save</button>
                                        <button onClick={() => setEditingQ(null)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #1C2B45', background: 'transparent', color: 'rgba(255,255,255,0.50)', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                                      </>
                                    ) : (
                                      <>
                                        <button onClick={() => setEditingQ({ ...q, options: q.options.map((o) => ({ ...o })) })} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #1C2B45', background: 'transparent', color: 'rgba(255,255,255,0.55)', fontSize: 12, cursor: 'pointer' }}>Edit</button>
                                        <button onClick={() => handleDeleteQuestion(group.id, q.id)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.30)', background: 'transparent', color: '#EF4444', fontSize: 12, cursor: 'pointer' }}>Delete</button>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Options */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  {eq.options.map((opt, idx) => (
                                    <div key={opt.key ?? idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                      <span style={{ width: 18, fontSize: 12, fontWeight: 700, color: ind?.color || '#3B82F6', flexShrink: 0 }}>{opt.key}</span>
                                      {isEditing ? (
                                        <>
                                          <input
                                            value={opt.text}
                                            onChange={(e) => setEditingQ((x) => ({ ...x, options: x.options.map((o, i) => i === idx ? { ...o, text: e.target.value } : o) }))}
                                            style={{ flex: 1, padding: '5px 8px', borderRadius: 5, background: '#060a16', border: '1px solid #1C2B45', color: 'rgba(255,255,255,0.85)', fontSize: 12, outline: 'none' }}
                                          />
                                          <input
                                            type="number" min="0" max="100"
                                            value={opt.score}
                                            onChange={(e) => setEditingQ((x) => ({ ...x, options: x.options.map((o, i) => i === idx ? { ...o, score: e.target.value } : o) }))}
                                            style={{ width: 52, padding: '5px 6px', borderRadius: 5, background: '#060a16', border: '1px solid #1C2B45', color: '#F59E0B', fontSize: 12, outline: 'none', textAlign: 'center' }}
                                          />
                                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>pts</span>
                                        </>
                                      ) : (
                                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', flex: 1 }}>
                                          {opt.text} <span style={{ color: '#F59E0B', fontWeight: 700 }}>({opt.score}pts)</span>
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}

                          {/* Add question to group */}
                          {addingQToGroup === group.id ? (
                            <div style={{ background: '#0D1528', border: '1px solid #3B82F6', borderRadius: 10, padding: 16 }}>
                              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                                <input
                                  value={newQ.text}
                                  onChange={(e) => setNewQ((q) => ({ ...q, text: e.target.value }))}
                                  placeholder="Question text…"
                                  style={{ flex: 1, padding: '8px 10px', borderRadius: 6, background: '#060a16', border: '1px solid #1C2B45', color: 'rgba(255,255,255,0.90)', fontSize: 13, outline: 'none' }}
                                />
                                <select
                                  value={newQ.indicator}
                                  onChange={(e) => setNewQ((q) => ({ ...q, indicator: e.target.value }))}
                                  style={{ padding: '8px 10px', borderRadius: 6, background: '#060a16', border: '1px solid #1C2B45', color: 'rgba(255,255,255,0.90)', fontSize: 12 }}
                                >
                                  {INDICATORS.map((i) => <option key={i.id} value={i.id}>{i.icon} {i.label}</option>)}
                                </select>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                                {newQ.options.map((opt, idx) => (
                                  <div key={opt.key} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span style={{ width: 18, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.40)', flexShrink: 0 }}>{opt.key}</span>
                                    <input
                                      value={opt.text}
                                      onChange={(e) => setNewQ((q) => ({ ...q, options: q.options.map((o, i) => i === idx ? { ...o, text: e.target.value } : o) }))}
                                      placeholder={`Option ${opt.key}`}
                                      style={{ flex: 1, padding: '5px 8px', borderRadius: 5, background: '#060a16', border: '1px solid #1C2B45', color: 'rgba(255,255,255,0.85)', fontSize: 12, outline: 'none' }}
                                    />
                                    <input
                                      type="number" min="0" max="100"
                                      value={opt.score}
                                      onChange={(e) => setNewQ((q) => ({ ...q, options: q.options.map((o, i) => i === idx ? { ...o, score: e.target.value } : o) }))}
                                      style={{ width: 52, padding: '5px 6px', borderRadius: 5, background: '#060a16', border: '1px solid #1C2B45', color: '#F59E0B', fontSize: 12, outline: 'none', textAlign: 'center' }}
                                    />
                                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>pts</span>
                                  </div>
                                ))}
                              </div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => handleAddQuestion(group.id)} disabled={savingQ} style={{ padding: '7px 18px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#3B82F6,#14B8A6)', color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer', opacity: savingQ ? 0.6 : 1 }}>
                                  {savingQ ? 'Adding…' : 'Add Question'}
                                </button>
                                <button onClick={() => { setAddingQToGroup(null); setNewQ(blankQ()) }} style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid #1C2B45', background: 'transparent', color: 'rgba(255,255,255,0.50)', fontSize: 12, cursor: 'pointer' }}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setAddingQToGroup(group.id); setNewQ(blankQ()) }}
                              style={{ alignSelf: 'flex-start', padding: '7px 16px', borderRadius: 8, border: '1px dashed rgba(59,130,246,0.40)', background: 'transparent', color: '#3B82F6', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                            >
                              + Add question
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
