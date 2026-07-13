import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'
import { getCockpitQuestions, submitCockpitAnswers } from '../api/cockpit.js'
import { useToast } from '../components/ui/Toast.jsx'
import { AVATARS, INDICATORS, getAvatar, scoreColor } from '../constants/avatars.js'

function fmtDate(d) {
  if (!d) return null
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d)
}

export default function CockpitPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuthStore()

  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [scores, setScores] = useState({})
  const [totals, setTotals] = useState({ answered: 0, total: 0 })
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const avatar = getAvatar(user?.selected_avatar)
  const [imgSrc, setImgSrc] = useState(avatar?.src)

  useEffect(() => { if (avatar) setImgSrc(avatar.src) }, [avatar?.id])

  useEffect(() => {
    getCockpitQuestions()
      .then(({ data }) => {
        setQuestions(data)
        const pre = {}
        let latest = null
        for (const q of data) {
          if (q.selected_option_id) pre[q.id] = q.selected_option_id
          if (q.selected_answered_at) {
            const t = new Date(q.selected_answered_at)
            if (!latest || t > latest) latest = t
          }
        }
        setAnswers(pre)
        if (latest) setLastUpdated(latest)
      })
      .catch(() => toast('Failed to load questions', 'error'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const indicatorScores = {}
    const indicatorCounts = {}
    for (const q of questions) {
      const optId = answers[q.id]
      if (!optId) continue
      const opt = q.options.find((o) => o.id === optId)
      if (!opt) continue
      indicatorScores[q.indicator] = (indicatorScores[q.indicator] || 0) + opt.score
      indicatorCounts[q.indicator] = (indicatorCounts[q.indicator] || 0) + 1
    }
    const avg = {}
    for (const ind of Object.keys(indicatorScores)) {
      avg[ind] = Math.round(indicatorScores[ind] / indicatorCounts[ind])
    }
    setScores(avg)
    setTotals({ answered: Object.keys(answers).length, total: questions.length })
  }, [answers, questions])

  const handleAnswer = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  const handleSave = async () => {
    const payload = Object.entries(answers).map(([question_id, option_id]) => ({ question_id, option_id }))
    if (payload.length === 0) { toast('Answer at least one question', 'error'); return }
    setSaving(true)
    try {
      await submitCockpitAnswers(payload)
      setLastUpdated(new Date())
      toast('Cockpit updated!', 'success')
    } catch {
      toast('Failed to save answers', 'error')
    } finally {
      setSaving(false)
    }
  }

  const cardStyle = {
    background: 'rgba(8,13,28,0.82)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 16,
  }

  return (
    <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'url(/cockpit-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'rgba(8,13,28,0.62)' }} />

      {/* ── Fixed top section ── */}
      <div style={{ position: 'relative', zIndex: 2, flexShrink: 0, padding: '24px 24px 16px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>

          <button onClick={() => navigate('/island')} style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontSize: 14, padding: '0 0 16px 0', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            ← Back to Island
          </button>

          {/* My Cockpit card */}
          <div style={{ ...cardStyle, padding: '24px 28px', display: 'flex', gap: 32, alignItems: 'flex-start' }}>

            {/* Avatar + name + timestamp */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              {avatar ? (
                <img
                  src={imgSrc}
                  onError={() => setImgSrc(avatar.placeholder)}
                  alt={avatar.name}
                  style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 20%', border: `3px solid ${avatar.color}`, marginBottom: 8, boxShadow: `0 0 18px ${avatar.color}55` }}
                />
              ) : (
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#1C2B45', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>✈️</div>
              )}
              <div style={{ fontSize: 14, fontWeight: 700, color: avatar?.color || 'rgba(255,255,255,0.7)' }}>
                {user?.display_name || 'No pilot'}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 3, fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                {lastUpdated ? `Updated ${fmtDate(lastUpdated)}` : 'Not updated yet'}
              </div>
              {!avatar && (
                <button onClick={() => navigate('/choose-pilot')} style={{ marginTop: 6, fontSize: 11, color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Choose pilot →
                </button>
              )}
            </div>

            {/* Indicators */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>My Cockpit</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{totals.answered}/{totals.total} answered</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {INDICATORS.map((ind) => {
                  const val = scores[ind.id] ?? null
                  const sc = scoreColor(val)
                  return (
                    <div key={ind.id} style={{ background: 'rgba(0,0,0,0.40)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: 14, color: ind.color }}>{ind.icon}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: ind.color }}>{ind.label}</span>
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 800, color: sc }}>
                          {val !== null ? val : '—'}
                        </span>
                      </div>
                      <div style={{ height: 5, background: 'rgba(255,255,255,0.10)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${val ?? 0}%`, background: sc, borderRadius: 3, transition: 'width 0.6s ease', boxShadow: `0 0 6px ${sc}88` }} />
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)', marginTop: 4 }}>{ind.sublabel}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrollable questionnaire ── */}
      <div style={{ position: 'relative', zIndex: 2, flex: 1, overflowY: 'auto', padding: '0 24px 32px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ ...cardStyle, padding: 28 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.92)', marginBottom: 4 }}>Questionnaire</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>
              Your answers determine your cockpit indicators. Update anytime.
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'rgba(255,255,255,0.30)' }}>Loading…</div>
            ) : questions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'rgba(255,255,255,0.30)' }}>No questions yet. Check back soon.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {questions.map((q, qi) => {
                  const ind = INDICATORS.find((i) => i.id === q.indicator)
                  return (
                    <div key={q.id}>
                      <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)', paddingTop: 2, flexShrink: 0 }}>{qi + 1}.</span>
                        <div>
                          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500, marginBottom: 4, lineHeight: 1.5 }}>
                            {q.text}
                          </div>
                          {ind && (
                            <span style={{ fontSize: 11, color: ind.color, fontWeight: 600 }}>
                              {ind.icon} {ind.label}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingLeft: 22 }}>
                        {q.options.map((opt) => {
                          const picked = answers[q.id] === opt.id
                          return (
                            <button
                              key={opt.id}
                              onClick={() => handleAnswer(q.id, opt.id)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                                padding: '9px 14px', borderRadius: 10,
                                background: picked ? `${ind?.color || '#3B82F6'}22` : 'rgba(0,0,0,0.35)',
                                border: `1.5px solid ${picked ? ind?.color || '#3B82F6' : '#1C2B45'}`,
                                cursor: 'pointer', transition: 'all 0.12s',
                              }}
                            >
                              <span style={{
                                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                background: picked ? ind?.color || '#3B82F6' : 'transparent',
                                border: `1.5px solid ${picked ? ind?.color || '#3B82F6' : '#374151'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 10, fontWeight: 700, color: picked ? 'white' : 'rgba(255,255,255,0.40)',
                              }}>
                                {opt.key}
                              </span>
                              <span style={{ fontSize: 13, color: picked ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.60)' }}>
                                {opt.text}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    alignSelf: 'flex-start', marginTop: 4,
                    padding: '11px 32px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg,#3B82F6,#14B8A6)',
                    color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? 'Saving…' : 'Update cockpit →'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
