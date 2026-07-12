import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'
import { getCockpitQuestions, submitCockpitAnswers } from '../api/cockpit.js'
import { useToast } from '../components/ui/Toast.jsx'
import { AVATARS, INDICATORS, getAvatar } from '../constants/avatars.js'

export default function CockpitPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuthStore()

  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({}) // question_id → option_id
  const [scores, setScores] = useState({})
  const [totals, setTotals] = useState({ answered: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const avatar = getAvatar(user?.selected_avatar)
  const [imgSrc, setImgSrc] = useState(avatar?.src)

  useEffect(() => {
    if (avatar) setImgSrc(avatar.src)
  }, [avatar?.id])

  useEffect(() => {
    getCockpitQuestions()
      .then(({ data }) => {
        setQuestions(data)
        const pre = {}
        for (const q of data) if (q.selected_option_id) pre[q.id] = q.selected_option_id
        setAnswers(pre)
      })
      .catch(() => toast('Failed to load questions', 'error'))
      .finally(() => setLoading(false))
  }, [])

  // Derive live scores from current answers + question options
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
    setTotals({
      answered: Object.keys(answers).length,
      total: questions.length,
    })
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
      toast('Cockpit updated!', 'success')
    } catch {
      toast('Failed to save answers', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', padding: '32px 24px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        <button onClick={() => navigate('/island')} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: 14, padding: '0 0 24px 0' }}>
          ← Back to Island
        </button>

        {/* ── Pilot + indicators ── */}
        <div style={{ background: '#141E35', border: '1px solid #1C2B45', borderRadius: 16, padding: 32, marginBottom: 20, display: 'flex', gap: 36, alignItems: 'flex-start' }}>

          {/* Avatar */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            {avatar ? (
              <img
                src={imgSrc}
                onError={() => setImgSrc(avatar.placeholder)}
                alt={avatar.name}
                style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', border: `4px solid ${avatar.color}`, marginBottom: 10 }}
              />
            ) : (
              <div style={{ width: 110, height: 110, borderRadius: '50%', background: '#1C2B45', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>✈</div>
            )}
            <div style={{ fontSize: 14, fontWeight: 700, color: avatar?.color || 'rgba(255,255,255,0.7)' }}>{avatar?.name || 'No pilot'}</div>
            {!avatar && (
              <button onClick={() => navigate('/choose-pilot')} style={{ marginTop: 8, fontSize: 12, color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer' }}>
                Choose pilot →
              </button>
            )}
          </div>

          {/* Indicators */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>My Cockpit</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
                {totals.answered}/{totals.total} answered
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {INDICATORS.map((ind) => {
                const val = scores[ind.id] ?? null
                return (
                  <div key={ind.id} style={{ background: '#0B1120', borderRadius: 12, padding: '14px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 16 }}>{ind.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: ind.color }}>{ind.label}</span>
                      </div>
                      <span style={{ fontSize: 20, fontWeight: 800, color: val !== null ? ind.color : 'rgba(255,255,255,0.20)' }}>
                        {val !== null ? val : '—'}
                      </span>
                    </div>
                    <div style={{ height: 6, background: '#1C2B45', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${val ?? 0}%`, background: ind.color, borderRadius: 4, transition: 'width 0.6s ease' }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', marginTop: 5 }}>{ind.description}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Questionnaire ── */}
        <div style={{ background: '#141E35', border: '1px solid #1C2B45', borderRadius: 16, padding: 32 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.92)', marginBottom: 6 }}>Questionnaire</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>
            Your answers determine your cockpit indicators. Update anytime.
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'rgba(255,255,255,0.30)' }}>Loading…</div>
          ) : questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'rgba(255,255,255,0.30)' }}>
              No questions yet. Check back soon.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {questions.map((q, qi) => {
                const ind = INDICATORS.find((i) => i.id === q.indicator)
                return (
                  <div key={q.id}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 22 }}>
                      {q.options.map((opt) => {
                        const picked = answers[q.id] === opt.id
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleAnswer(q.id, opt.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                              padding: '10px 14px', borderRadius: 10,
                              background: picked ? `${ind?.color || '#3B82F6'}18` : '#0B1120',
                              border: `1.5px solid ${picked ? ind?.color || '#3B82F6' : '#1C2B45'}`,
                              cursor: 'pointer', transition: 'all 0.12s',
                            }}
                          >
                            <span style={{
                              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                              background: picked ? ind?.color || '#3B82F6' : 'transparent',
                              border: `1.5px solid ${picked ? ind?.color || '#3B82F6' : '#374151'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, fontWeight: 700, color: picked ? 'white' : 'rgba(255,255,255,0.40)',
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
                  alignSelf: 'flex-start', marginTop: 8,
                  padding: '12px 32px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg,#3B82F6,#14B8A6)',
                  color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer',
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
  )
}
