import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useIslandStore from '../store/islandStore.js'
import '../styles/island.css'

// ─── Severity helpers ────────────────────────────────────────────────────────
const SEV = {
  high:     { label: 'HIGH',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  glow: '#ef444455' },
  moderate: { label: 'MODERATE', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', glow: '#f59e0b55' },
  low:      { label: 'LOW',      color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  glow: '#22c55e55' },
}

function useSeverity(stakeholders) {
  return useMemo(() => {
    const getStatus = (s) => s.overall_status ?? s.climate?.overall_status ?? 'unknown'
    const crit = stakeholders.filter((s) => getStatus(s) === 'critical').length
    const att  = stakeholders.filter((s) => getStatus(s) === 'attention').length
    if (crit > 0) return { ...SEV.high,     crit, att, total: stakeholders.length }
    if (att  > 0) return { ...SEV.moderate,  crit, att, total: stakeholders.length }
    return           { ...SEV.low,          crit, att, total: stakeholders.length }
  }, [stakeholders])
}

// ─── Star field ──────────────────────────────────────────────────────────────
function StarField() {
  const stars = useMemo(() =>
    Array.from({ length: 180 }, (_, i) => ({
      cx: ((Math.sin(i * 137.508 + 1) * 0.5 + 0.5) * 100).toFixed(2),
      cy: ((Math.cos(i * 97.31  + 2) * 0.5 + 0.5) * 100).toFixed(2),
      r:  i % 7 === 0 ? 1.4 : i % 3 === 0 ? 0.9 : 0.5,
      op: (0.25 + (i % 8) * 0.08).toFixed(2),
      delay: ((i * 0.4) % 4).toFixed(1),
    }))
  , [])

  return (
    <svg
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
      preserveAspectRatio="xMidYMid slice"
    >
      {stars.map((s, i) => (
        <circle key={i} cx={`${s.cx}%`} cy={`${s.cy}%`} r={s.r} fill="white" opacity={s.op}
          style={{ animation: `twinkle ${2.5 + +s.delay}s ease-in-out infinite`, animationDelay: `${s.delay}s` }} />
      ))}
    </svg>
  )
}

// ─── Cloud shape ─────────────────────────────────────────────────────────────
function Cloud({ x, y, scale = 1, dark = false }) {
  const base  = dark ? '#1f2937' : '#374151'
  const light = dark ? '#374151' : '#6b7280'
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <ellipse cx="0"  cy="0"   rx="26" ry="13" fill={base}  opacity="0.90" />
      <ellipse cx="10" cy="-9"  rx="16" ry="11" fill={light} opacity="0.85" />
      <ellipse cx="-10" cy="-7" rx="14" ry="9"  fill={base}  opacity="0.80" />
      <ellipse cx="1"  cy="-6"  rx="12" ry="9"  fill={light} opacity="0.75" />
    </g>
  )
}

// ─── Earth globe ─────────────────────────────────────────────────────────────
function EarthGlobe({ sev }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0 24px', position: 'relative', zIndex: 1 }}>
      <svg viewBox="-200 -200 400 400" width="460" height="460" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="earth-grad" cx="38%" cy="32%" r="60%">
            <stop offset="0%"   stopColor="#1a6b9a" />
            <stop offset="35%"  stopColor="#0d4f73" />
            <stop offset="70%"  stopColor="#0a3558" />
            <stop offset="100%" stopColor="#050f1e" />
          </radialGradient>
          <radialGradient id="atmo-grad" cx="50%" cy="50%" r="50%">
            <stop offset="70%"  stopColor="transparent" />
            <stop offset="100%" stopColor="#3b82f688" />
          </radialGradient>
          <clipPath id="earth-clip"><circle r="118" /></clipPath>
          <filter id="cloud-blur"><feGaussianBlur stdDeviation="1.5" /></filter>
          <filter id="earth-shadow">
            <feDropShadow dx="0" dy="0" stdDeviation="18" floodColor="#3b82f6" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Outer space glow rings */}
        <circle r="170" fill="none" stroke="#1e3a5f" strokeWidth="1" opacity="0.2" />
        <circle r="155" fill="none" stroke="#3b82f6" strokeWidth="0.5" opacity="0.12"
          style={{ animation: 'earth-breathe 5s ease-in-out infinite' }} />

        {/* Earth body */}
        <circle r="118" fill="url(#earth-grad)" filter="url(#earth-shadow)" />

        {/* Simplified continents */}
        <g clipPath="url(#earth-clip)" fill="#1a5c32" opacity="0.65">
          {/* Africa + Europe */}
          <ellipse cx="18"  cy="-15" rx="28" ry="52" />
          <ellipse cx="10"  cy="-58" rx="18" ry="20" />
          {/* Americas */}
          <ellipse cx="-72" cy="-10" rx="20" ry="50" />
          <ellipse cx="-58" cy="-52" rx="16" ry="22" />
          {/* Asia + Russia */}
          <ellipse cx="58"  cy="-35" rx="46" ry="32" />
          <ellipse cx="82"  cy="-70" rx="28" ry="22" />
          {/* Australia */}
          <ellipse cx="80"  cy="60"  rx="18" ry="12" />
        </g>

        {/* Atmosphere limb glow */}
        <circle r="118" fill="url(#atmo-grad)" />
        <circle r="118" fill="none" stroke="#60a5fa" strokeWidth="10" opacity="0.10" />
        <circle r="121" fill="none" stroke="#60a5fa" strokeWidth="4"  opacity="0.06" />

        {/* Severity ring */}
        <circle r="126" fill="none" stroke={sev.color} strokeWidth="2"
          style={{ animation: 'severity-ring 2.5s ease-in-out infinite' }} />

        {/* Storm cloud orbit 1 — slow, wide */}
        <g style={{ animation: 'orbit 28s linear infinite', transformOrigin: '0 0' }}>
          <Cloud x={140} y={-15}  scale={1.1} dark />
          <Cloud x={-60} y={148}  scale={0.9} />
        </g>

        {/* Storm cloud orbit 2 — medium, reverse */}
        <g style={{ animation: 'orbit-rev 20s linear infinite', transformOrigin: '0 0' }}>
          <Cloud x={-148} y={10}  scale={1.0} dark />
          <Cloud x={80}   y={-138} scale={0.85} />
        </g>

        {/* Storm cloud orbit 3 — fast, tight */}
        <g style={{ animation: 'orbit 14s linear infinite', transformOrigin: '0 0' }}>
          <Cloud x={0}   y={138}  scale={0.75} />
          <Cloud x={-95} y={-108} scale={0.70} dark />
          <Cloud x={120} y={80}   scale={0.80} />
        </g>

        {/* North pole cap */}
        <ellipse cx="0" cy="-108" rx="32" ry="14" fill="#e2e8f0" opacity="0.25" clipPath="url(#earth-clip)" />
        {/* South pole cap */}
        <ellipse cx="0" cy="110"  rx="28" ry="12" fill="#e2e8f0" opacity="0.20" clipPath="url(#earth-clip)" />
      </svg>
    </div>
  )
}

// ─── World perception indicators ─────────────────────────────────────────────
const WORLD_INDICATORS = [
  { icon: '🌍', label: 'Global Alignment',   value: 'Moderate',  color: '#f59e0b', trend: '→' },
  { icon: '📊', label: 'Market Sentiment',   value: 'Bearish',   color: '#ef4444', trend: '↓' },
  { icon: '⚡', label: 'Disruption Index',   value: 'Elevated',  color: '#ef4444', trend: '↑' },
  { icon: '🏛️', label: 'Regulatory Climate', value: 'Stable',    color: '#22c55e', trend: '→' },
  { icon: '🌐', label: 'Digital Pulse',      value: 'Active',    color: '#3b82f6', trend: '↑' },
  { icon: '💹', label: 'Econ. Pressure',     value: 'Rising',    color: '#f59e0b', trend: '↑' },
]

function PerceptionPanel() {
  return (
    <div style={{
      background: 'rgba(11,17,32,0.80)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
        🌐 World Perception
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {WORLD_INDICATORS.map((ind) => (
          <div key={ind.label} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10, padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>{ind.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                {ind.label}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: ind.color }}>
                {ind.value}
              </div>
            </div>
            <span style={{ fontSize: 14, color: ind.color, fontWeight: 700 }}>{ind.trend}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 9, color: 'rgba(255,255,255,0.18)', textAlign: 'right', letterSpacing: '0.06em' }}>
        DATA VIA API — COMING SOON
      </div>
    </div>
  )
}

// ─── News feed ───────────────────────────────────────────────────────────────
const NEWS_PLACEHOLDERS = [
  { id: 1, tag: 'MARKETS',      headline: 'Global market volatility reaches 6-month high amid geopolitical tensions' },
  { id: 2, tag: 'REGULATION',   headline: 'New ESG compliance framework announced across EU member states' },
  { id: 3, tag: 'TECHNOLOGY',   headline: 'AI adoption accelerates in enterprise stakeholder management sectors' },
  { id: 4, tag: 'GEOPOLITICS',  headline: 'Trade negotiations impact supply chain relationships across key regions' },
  { id: 5, tag: 'SUSTAINABILITY', headline: 'Carbon neutrality pledges reshape stakeholder expectations for 2027' },
]

const TAG_CLR = {
  MARKETS: '#f59e0b', REGULATION: '#3b82f6', TECHNOLOGY: '#10b981',
  GEOPOLITICS: '#ef4444', SUSTAINABILITY: '#22c55e',
}

function NewsFeed() {
  return (
    <div style={{
      background: 'rgba(11,17,32,0.80)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          📡 Intelligence Feed
        </div>
        <span style={{
          fontSize: 8, fontWeight: 700, color: '#f59e0b',
          background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 4, padding: '2px 7px', letterSpacing: '0.08em',
        }}>
          API PENDING
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {NEWS_PLACEHOLDERS.map((item) => (
          <div key={item.id} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10, padding: '10px 14px',
            opacity: 0.6 + item.id * 0.06,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <span style={{
                fontSize: 8, fontWeight: 700, color: TAG_CLR[item.tag] || '#6b7280',
                letterSpacing: '0.08em',
              }}>
                {item.tag}
              </span>
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.20)' }}>· · ·</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.45 }}>
              {item.headline}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, fontSize: 9, color: 'rgba(255,255,255,0.18)', textAlign: 'right', letterSpacing: '0.06em' }}>
        LIVE FEED — CONNECT API TO POPULATE
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function StormCloudPage() {
  const navigate   = useNavigate()
  const stakeholders = useIslandStore((s) => s.stakeholders)
  const sev        = useSeverity(stakeholders)

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 40%, #050d1f 0%, #020408 70%)', overflow: 'hidden', position: 'relative' }}>
      <StarField />

      {/* Top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(2,4,8,0.82)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', padding: '0 24px', height: 56, gap: 16,
      }}>
        <button
          onClick={() => navigate('/island')}
          style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8, color: 'rgba(255,255,255,0.55)', cursor: 'pointer',
            padding: '6px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          ← Island
        </button>

        <div style={{
          fontSize: 15, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          ⛈ Storm Cloud
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.08em' }}>SEVERITY</span>
          <span style={{
            fontSize: 12, fontWeight: 700, color: sev.color,
            background: sev.bg, border: `1px solid ${sev.color}44`,
            borderRadius: 6, padding: '4px 12px', letterSpacing: '0.07em',
          }}>
            ● {sev.label}
          </span>
          {sev.crit > 0 && (
            <span style={{ fontSize: 11, color: '#ef444499' }}>{sev.crit} critical</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingTop: 56, position: 'relative', zIndex: 1 }}>
        <EarthGlobe sev={sev} />

        <div style={{
          maxWidth: 1060, margin: '0 auto', padding: '0 24px 60px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20,
        }}>
          <PerceptionPanel />
          <NewsFeed />
        </div>
      </div>
    </div>
  )
}
