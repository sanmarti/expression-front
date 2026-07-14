import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'
import { getCockpitQuestions, submitCockpitAnswers } from '../api/cockpit.js'
import { useToast } from '../components/ui/Toast.jsx'
import { AVATARS, INDICATORS, getAvatar, scoreColor, indicatorColor, radiationColor, getConfidenceScore, getConfidenceCount } from '../constants/avatars.js'

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

  const confidence      = getConfidenceScore()
  const tuneCount       = getConfidenceCount()

  const BULB_FILTER = [
    'grayscale(1) brightness(0.18)',
    'grayscale(0.75) brightness(0.38)',
    'grayscale(0.35) brightness(0.62)',
    'brightness(1.10) drop-shadow(0 0 8px rgba(251,191,36,0.55))',
    'brightness(1.55) drop-shadow(0 0 18px rgba(251,191,36,0.80))',
    'brightness(2.20) drop-shadow(0 0 30px rgba(251,191,36,1.00))',
  ]
  const BULB_SIZE = [26, 28, 32, 38, 44, 54]

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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16 }}>
            <button onClick={() => navigate('/island')} style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontSize: 14, padding: 0, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
              ← Back to Island
            </button>
            <button
              onClick={() => navigate('/archetypes')}
              style={{
                padding: '8px 18px', borderRadius: 10, border: '1px solid rgba(139,92,246,0.40)',
                background: 'rgba(139,92,246,0.12)', color: '#c4b5fd',
                cursor: 'pointer', fontSize: 13, fontWeight: 700, letterSpacing: '0.03em',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 0 16px rgba(139,92,246,0.20)',
                transition: 'all 0.15s',
              }}
            >
              ✦ My Archetypes
            </button>
          </div>

          {/* My Cockpit card */}
          <div style={{ ...cardStyle, padding: '28px 32px', display: 'flex', gap: 0, alignItems: 'center' }}>

            {/* Left — Avatar + identity */}
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 160 }}>
              {avatar ? (
                <img
                  src={imgSrc}
                  onError={() => setImgSrc(avatar.placeholder)}
                  alt={avatar.name}
                  style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 20%', border: `3px solid ${avatar.color}`, boxShadow: `0 0 22px ${avatar.color}55`, display: 'block' }}
                />
              ) : (
                <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#1C2B45', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>✈️</div>
              )}
              <div style={{ fontSize: 14, fontWeight: 700, color: avatar?.color || 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                {user?.display_name || 'No pilot'}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', letterSpacing: '0.04em', textAlign: 'center' }}>
                {lastUpdated ? `Updated ${fmtDate(lastUpdated)}` : 'Not updated yet'}
              </div>
              <span style={{
                fontSize: BULB_SIZE[tuneCount],
                filter: BULB_FILTER[tuneCount],
                transition: 'font-size 0.5s ease, filter 0.5s ease',
                display: 'block', textAlign: 'center', marginTop: 6,
                lineHeight: 1,
              }}>💡</span>
              {!avatar && (
                <button onClick={() => navigate('/choose-pilot')} style={{ fontSize: 11, color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Choose pilot →
                </button>
              )}
            </div>

            {/* Divider */}
            <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(255,255,255,0.07)', margin: '0 32px', flexShrink: 0 }} />

            {/* Right — Indicators */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.92)', letterSpacing: '0.01em' }}>My Cockpit</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)' }}>{totals.answered}/{totals.total} answered</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {INDICATORS.map((ind) => {
                  const val = scores[ind.id] ?? null
                  const sc = indicatorColor(ind.id, val)
                  return (
                    <div key={ind.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 14, color: radiationColor(ind.id, ind.color) }}>{ind.icon}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: radiationColor(ind.id, ind.color), letterSpacing: '0.04em' }}>{ind.label}</span>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)' }}>— {ind.sublabel}</span>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 800, color: sc, fontFamily: 'monospace' }}>
                          {val !== null ? val : '—'}
                        </span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${val ?? 0}%`, background: sc, borderRadius: 2, transition: 'width 0.6s ease', boxShadow: `0 0 5px ${sc}88` }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {confidence && (
                <div style={{
                  marginTop: 16,
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: 10, padding: '11px 16px',
                }}>
                  <div style={{ fontSize: 12, color: '#10B981', fontWeight: 700, marginBottom: 4, letterSpacing: '0.04em' }}>
                    {confidence.count}/5 Tuned Instruments
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                    {confidence.label}
                  </div>
                </div>
              )}
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
