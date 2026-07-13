import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getStakeholder, updateStakeholder, deleteStakeholder } from '../api/stakeholders.js'
import WeatherEffect from '../components/island/WeatherEffect.jsx'
import ClimateCard from '../components/stakeholder/ClimateCard.jsx'
import ClimateHistory from '../components/stakeholder/ClimateHistory.jsx'
import Badge from '../components/ui/Badge.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import TrendIndicator from '../components/stakeholder/TrendIndicator.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useOrganization } from '../hooks/useOrganization.js'
import useIslandStore from '../store/islandStore.js'

const ZONES = {
  forest:'🌲', mountain:'⛰️', beach:'🏖️', jungle:'🌴',
  desert:'🏜️', river:'🌊', lake:'💧', coast:'🌊', volcano:'🌋',
}
const CATEGORIES = ['Client','Supplier','Partner','Regulator','Internal','Other']
const sentimentVariant = { positive:'green', neutral:'gray', negative:'red', mixed:'amber', unknown:'gray' }
const riskColor = (v) => v <= 3 ? '#10B981' : v <= 6 ? '#F59E0B' : '#EF4444'

export default function StakeholderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { isAdmin } = useOrganization()
  const removeStakeholder = useIslandStore((s) => s.removeStakeholder)
  const updateStakeholderInStore = useIslandStore((s) => s.updateStakeholder)
  const [stakeholder, setStakeholder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('climate')
  const [infoForm, setInfoForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getStakeholder(id)
      .then(({ data }) => { setStakeholder(data); setInfoForm(data) })
      .catch(() => navigate('/island'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleDelete = async () => {
    if (!confirm(`Delete "${stakeholder.name}"? This cannot be undone.`)) return
    try {
      await deleteStakeholder(id)
      removeStakeholder(id)
      navigate('/island')
    } catch {
      toast('Failed to delete', 'error')
    }
  }

  const handleSaveInfo = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await updateStakeholder(id, infoForm)
      setStakeholder(data)
      updateStakeholderInStore(id, { name: data.name, emoji: data.emoji })
      toast('Saved', 'success')
    } catch {
      toast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const tabStyle = (t) => ({
    padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer',
    fontSize: 14, fontWeight: 600,
    color: tab === t ? '#3B82F6' : 'rgba(255,255,255,0.50)',
    borderBottom: `2px solid ${tab === t ? '#3B82F6' : 'transparent'}`,
  })

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0B1120' }}><Spinner size={48} /></div>
  if (!stakeholder) return null

  const c = stakeholder.climate || {}
  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8, marginTop: 6,
    background: '#0B1120', border: '1px solid #1C2B45',
    color: 'rgba(255,255,255,0.92)', fontSize: 14, outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: 300, flexShrink: 0, background: '#141E35', borderRight: '1px solid #1C2B45', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <button onClick={() => navigate('/island')} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: 14, padding: 0, textAlign: 'left' }}>
          ← Back to Island
        </button>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <WeatherEffect weather_type={c.weather_type} size="large" />
        </div>

        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.92)', margin: 0 }}>{stakeholder.name}</h2>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {stakeholder.zone && <Badge variant="teal">{ZONES[stakeholder.zone] || ''} {stakeholder.zone}</Badge>}
            {stakeholder.category && <Badge variant="blue">{stakeholder.category}</Badge>}
          </div>
          {stakeholder.description && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 10, lineHeight: 1.5 }}>{stakeholder.description}</p>
          )}
        </div>

        <div style={{ borderTop: '1px solid #1C2B45', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {c.risk_level && (
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', marginBottom: 6 }}>Risk Level</div>
              <ProgressBar value={c.risk_level} max={10} color={riskColor(c.risk_level)} />
            </div>
          )}
          {c.sentiment && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)' }}>Sentiment</span>
              <Badge variant={sentimentVariant[c.sentiment] || 'gray'}>{c.sentiment}</Badge>
            </div>
          )}
          {c.trend && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)' }}>Trend</span>
              <TrendIndicator trend={c.trend} />
            </div>
          )}
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
            <button onClick={() => setTab('info')} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #1C2B45', background: 'transparent', color: 'rgba(255,255,255,0.70)', cursor: 'pointer', fontSize: 13 }}>
              ✏️ Edit
            </button>
            <button onClick={handleDelete} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#EF4444', cursor: 'pointer', fontSize: 13 }}>
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

      {/* Main area */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ borderBottom: '1px solid #1C2B45', display: 'flex' }}>
          {['climate','history','info'].map((t) => (
            <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ padding: 28 }}>
          {tab === 'climate' && <ClimateCard stakeholder={stakeholder} />}
          {tab === 'history' && <ClimateHistory stakeholderId={id} />}
          {tab === 'info' && (
            <form onSubmit={handleSaveInfo} style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[['emoji','Emoji'],['name','Name'],['description','Description'],['category','Category'],['zone','Zone']].map(([field, label]) => (
                <div key={field}>
                  <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{label}</label>
                  {field === 'emoji' ? (
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                      {[
                        { em: '🏕️', label: 'Bush Camp' },
                        { em: '⛺',  label: 'Base Camp' },
                        { em: '🛖',  label: 'Shelter' },
                        { em: '🏠',  label: 'House' },
                        { em: '🏡',  label: 'Homestead' },
                        { em: '🏘️', label: 'Settlement' },
                      ].map(({ em, label }) => {
                        const selected = (infoForm.emoji || '🏕️') === em
                        return (
                          <button key={em} type="button"
                            onClick={() => setInfoForm((f) => ({ ...f, emoji: em }))}
                            style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                              padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                              background: selected ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                              border: `1.5px solid ${selected ? '#3B82F6' : 'rgba(255,255,255,0.10)'}`,
                              boxShadow: selected ? '0 0 12px rgba(59,130,246,0.25)' : 'none',
                              transition: 'all 0.12s',
                            }}
                          >
                            <span style={{ fontSize: 28, lineHeight: 1 }}>{em}</span>
                            <span style={{ fontSize: 10, color: selected ? '#3B82F6' : 'rgba(255,255,255,0.40)', fontFamily: 'monospace', fontWeight: selected ? 700 : 400, letterSpacing: '0.04em' }}>
                              {label.toUpperCase()}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  ) : field === 'description' ? (
                    <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
                      value={infoForm[field] || ''} onChange={(e) => setInfoForm((f) => ({ ...f, [field]: e.target.value }))} />
                  ) : field === 'category' ? (
                    <select style={inputStyle} value={infoForm[field] || ''} onChange={(e) => setInfoForm((f) => ({ ...f, [field]: e.target.value }))}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  ) : field === 'zone' ? (
                    <select style={inputStyle} value={infoForm[field] || ''} onChange={(e) => setInfoForm((f) => ({ ...f, [field]: e.target.value }))}>
                      {Object.keys(ZONES).map((z) => <option key={z} value={z}>{ZONES[z]} {z}</option>)}
                    </select>
                  ) : (
                    <input style={inputStyle} value={infoForm[field] || ''} onChange={(e) => setInfoForm((f) => ({ ...f, [field]: e.target.value }))} />
                  )}
                </div>
              ))}
              <button type="submit" disabled={saving} style={{
                padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#3B82F6,#14B8A6)', color: 'white', fontWeight: 600,
                alignSelf: 'flex-start', opacity: saving ? 0.7 : 1,
              }}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
