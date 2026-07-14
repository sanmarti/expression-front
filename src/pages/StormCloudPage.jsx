import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/island.css'

// ─── Intelligence feeds ───────────────────────────────────────────────────────
const FEEDS = [
  {
    id: 'political',
    icon: '🏛️',
    label: 'Political & Social',
    color: '#6366f1',
    description: 'Power structures, governance & social movements',
    indicators: [
      { icon: '🗳️', label: 'Political Stability',  value: 'Fragile',   color: '#ef4444', trend: '↓' },
      { icon: '⚔️', label: 'Social Tension',       value: 'Elevated',  color: '#ef4444', trend: '↑' },
      { icon: '🤝', label: 'Institutional Trust',  value: 'Declining', color: '#f59e0b', trend: '↓' },
      { icon: '📢', label: 'Public Discourse',     value: 'Polarised', color: '#ef4444', trend: '↑' },
      { icon: '⚖️', label: 'Civil Rights Index',   value: 'Moderate',  color: '#f59e0b', trend: '→' },
      { icon: '🏛️', label: 'Policy Effectiveness', value: 'Improving', color: '#22c55e', trend: '↑' },
    ],
    news: [
      { id: 1, tag: 'POLITICS',  headline: 'Populist movements reshape legislative agendas across European democracies' },
      { id: 2, tag: 'SOCIETY',   headline: 'Generational divide widens on housing, climate and social contract expectations' },
      { id: 3, tag: 'ELECTIONS', headline: 'Record voter turnout signals civic reengagement in three major national elections' },
      { id: 4, tag: 'RIGHTS',    headline: 'Digital civil liberties frameworks under pressure as surveillance capabilities expand' },
      { id: 5, tag: 'POLICY',    headline: 'Cross-party coalitions form around industrial policy and strategic autonomy goals' },
    ],
  },
  {
    id: 'environmental',
    icon: '🌍',
    label: 'Environmental & Habitat',
    color: '#22c55e',
    description: 'Ecological systems, climate & biodiversity signals',
    indicators: [
      { icon: '🌡️', label: 'Climate Risk',      value: 'Critical',  color: '#ef4444', trend: '↑' },
      { icon: '🌿', label: 'Biodiversity',      value: 'Declining', color: '#ef4444', trend: '↓' },
      { icon: '💧', label: 'Water Stress',      value: 'Regional',  color: '#f59e0b', trend: '↑' },
      { icon: '🌬️', label: 'Air Quality',       value: 'Variable',  color: '#f59e0b', trend: '→' },
      { icon: '🌱', label: 'Carbon Transition', value: 'Lagging',   color: '#f59e0b', trend: '→' },
      { icon: '🌊', label: 'Ocean Health',      value: 'Critical',  color: '#ef4444', trend: '↓' },
    ],
    news: [
      { id: 1, tag: 'CLIMATE',     headline: 'IPCC warns of accelerating tipping points as global temperatures breach records' },
      { id: 2, tag: 'BIODIVERSITY',headline: 'One million species at risk as habitat loss accelerates across tropical regions' },
      { id: 3, tag: 'ENERGY',      headline: 'Renewable capacity additions outpace fossil fuel investment for second year' },
      { id: 4, tag: 'WATER',       headline: 'Freshwater scarcity affects two billion people as aquifer depletion accelerates' },
      { id: 5, tag: 'OCEANS',      headline: 'Coral bleaching events now occurring five times more frequently than in the 1980s' },
    ],
  },
  {
    id: 'culture',
    icon: '🎭',
    label: 'Values & Culture',
    color: '#f59e0b',
    description: 'Cultural shifts, identity & collective meaning',
    indicators: [
      { icon: '🎭', label: 'Cultural Cohesion',  value: 'Strained',  color: '#f59e0b', trend: '↓' },
      { icon: '🪞', label: 'Identity Dynamics',  value: 'Fluid',     color: '#f59e0b', trend: '→' },
      { icon: '📰', label: 'Media Narrative',    value: 'Fragmented',color: '#ef4444', trend: '↓' },
      { icon: '🕊️', label: 'Shared Values',      value: 'Eroding',   color: '#ef4444', trend: '↓' },
      { icon: '🎨', label: 'Creative Expression',value: 'Thriving',  color: '#22c55e', trend: '↑' },
      { icon: '🌐', label: 'Global vs Local',    value: 'Tension',   color: '#f59e0b', trend: '→' },
    ],
    news: [
      { id: 1, tag: 'CULTURE',   headline: 'Declining trust in mainstream media accelerates fragmentation of shared narratives' },
      { id: 2, tag: 'IDENTITY',  headline: 'Cultural identity movements reshape brand strategy and organisational values' },
      { id: 3, tag: 'ARTS',      headline: 'AI-generated content triggers debate over authorship, creativity and intellectual property' },
      { id: 4, tag: 'VALUES',    headline: 'Generational value shifts drive demand for authentic, purpose-led organisations' },
      { id: 5, tag: 'COMMUNITY', headline: 'Local cultural revival movements grow as counterweight to digital homogenisation' },
    ],
  },
  {
    id: 'mental',
    icon: '🧠',
    label: 'Mental & Spiritual Health',
    color: '#a78bfa',
    description: 'Collective wellbeing, consciousness & meaning-making',
    indicators: [
      { icon: '🧠', label: 'Mental Health Index', value: 'Declining', color: '#ef4444', trend: '↓' },
      { icon: '😰', label: 'Anxiety Levels',      value: 'High',      color: '#ef4444', trend: '↑' },
      { icon: '🌟', label: 'Meaning & Purpose',   value: 'Searching', color: '#f59e0b', trend: '→' },
      { icon: '🤲', label: 'Community Bonds',     value: 'Weakening', color: '#f59e0b', trend: '↓' },
      { icon: '🧘', label: 'Spiritual Seeking',   value: 'Rising',    color: '#22c55e', trend: '↑' },
      { icon: '⚡', label: 'Burnout Index',       value: 'Elevated',  color: '#ef4444', trend: '↑' },
    ],
    news: [
      { id: 1, tag: 'WELLBEING',  headline: 'Global mental health crisis deepens as loneliness and anxiety reach record levels' },
      { id: 2, tag: 'BURNOUT',    headline: 'Workplace burnout costs economies trillions annually as presenteeism rises' },
      { id: 3, tag: 'SPIRITUAL',  headline: 'Rise of non-institutional spirituality reshapes how people find meaning and community' },
      { id: 4, tag: 'THERAPY',    headline: 'Digital mental health platforms see 300% growth but raise quality and access concerns' },
      { id: 5, tag: 'PURPOSE',    headline: 'Employees increasingly prioritise meaning over compensation in career decisions' },
    ],
  },
  {
    id: 'tech',
    icon: '🤖',
    label: 'Tech & Digital',
    color: '#38bdf8',
    description: 'AI disruption, digital infrastructure & cyber dynamics',
    indicators: [
      { icon: '🤖', label: 'AI Adoption',      value: 'Rapid',     color: '#22c55e', trend: '↑' },
      { icon: '🔐', label: 'Cyber Risk',       value: 'Elevated',  color: '#ef4444', trend: '↑' },
      { icon: '📡', label: 'Digital Access',   value: 'Expanding', color: '#22c55e', trend: '↑' },
      { icon: '⚖️', label: 'AI Regulation',    value: 'Emerging',  color: '#f59e0b', trend: '→' },
      { icon: '🚀', label: 'Innovation Index', value: 'Strong',    color: '#22c55e', trend: '↑' },
      { icon: '🏢', label: 'Platform Power',   value: 'Dominant',  color: '#ef4444', trend: '↑' },
    ],
    news: [
      { id: 1, tag: 'AI',        headline: 'Foundation model capabilities trigger new wave of enterprise automation cycles' },
      { id: 2, tag: 'CYBER',     headline: 'State-sponsored attacks on critical infrastructure double in twelve months' },
      { id: 3, tag: 'POLICY',    headline: 'G7 nations align on AI safety standards ahead of global governance summit' },
      { id: 4, tag: 'QUANTUM',   headline: 'Quantum computing breakthroughs accelerate timeline for cryptography disruption' },
      { id: 5, tag: 'PLATFORMS', headline: 'Platform consolidation reshapes digital advertising and data broker ecosystems' },
    ],
  },
  {
    id: 'economic',
    icon: '💰',
    label: 'Economic & Financial',
    color: '#3b82f6',
    description: 'Markets, resource flows & economic resilience',
    indicators: [
      { icon: '💹', label: 'Market Sentiment',  value: 'Cautious',   color: '#f59e0b', trend: '↓' },
      { icon: '📉', label: 'Volatility Index',  value: 'High',       color: '#ef4444', trend: '↑' },
      { icon: '🏦', label: 'Credit Conditions', value: 'Tightening', color: '#f59e0b', trend: '↓' },
      { icon: '💰', label: 'Liquidity',         value: 'Moderate',   color: '#f59e0b', trend: '→' },
      { icon: '📈', label: 'Growth Outlook',    value: 'Slowing',    color: '#f59e0b', trend: '↓' },
      { icon: '👷', label: 'Employment',        value: 'Resilient',  color: '#22c55e', trend: '→' },
    ],
    news: [
      { id: 1, tag: 'MARKETS',  headline: 'Global equities retreat as central banks signal higher-for-longer rates' },
      { id: 2, tag: 'ECONOMY',  headline: 'Manufacturing PMI contracts for third consecutive month across G7 nations' },
      { id: 3, tag: 'FINANCE',  headline: 'Corporate bond spreads widen amid rising default concerns in real estate sector' },
      { id: 4, tag: 'TRADE',    headline: 'Supply chain diversification accelerates as firms reduce single-country dependency' },
      { id: 5, tag: 'CURRENCY', headline: 'Dollar strengthens against emerging market currencies on Fed rate expectations' },
    ],
  },
]

// ─── Severity helpers ─────────────────────────────────────────────────────────
const SEV = {
  high:     { label: 'HIGH',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  moderate: { label: 'MODERATE', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  low:      { label: 'LOW',      color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
}

// Severity is derived from the feed indicator colours across all 6 feeds.
// Per feed: whichever colour (red/orange/green) has the most indicators wins.
// Overall: any feed rated critical → HIGH; any feed rated attention → MODERATE; else LOW.
function useSeverity() {
  return useMemo(() => {
    let hasCritical = false
    let hasAttention = false

    for (const feed of FEEDS) {
      const reds    = feed.indicators.filter((i) => i.color === '#ef4444').length
      const oranges = feed.indicators.filter((i) => i.color === '#f59e0b').length
      const greens  = feed.indicators.filter((i) => i.color === '#22c55e').length

      if (reds >= oranges && reds >= greens)  hasCritical = true
      else if (oranges >= greens)             hasAttention = true
    }

    if (hasCritical)  return SEV.high
    if (hasAttention) return SEV.moderate
    return SEV.low
  }, [])
}

// ─── Feed selector ────────────────────────────────────────────────────────────
function FeedSelector({ activeFeedId, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 8, justifyContent: 'center',
      padding: '0 24px 28px', flexWrap: 'wrap',
    }}>
      {FEEDS.map((feed) => {
        const active = activeFeedId === feed.id
        return (
          <button
            key={feed.id}
            onClick={() => onChange(feed.id)}
            style={{
              padding: '8px 18px', borderRadius: 20, cursor: 'pointer',
              background: active ? `${feed.color}22` : 'rgba(0,0,0,0.45)',
              border: `1px solid ${active ? feed.color : 'rgba(255,255,255,0.12)'}`,
              color: active ? feed.color : 'rgba(255,255,255,0.50)',
              fontSize: 12, fontWeight: active ? 700 : 500,
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.18s',
              boxShadow: active ? `0 0 14px ${feed.color}44` : 'none',
              backdropFilter: 'blur(10px)',
            }}
          >
            <span style={{ fontSize: 14 }}>{feed.icon}</span>
            {feed.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── World perception indicators ─────────────────────────────────────────────
function PerceptionPanel({ feed }) {
  return (
    <div style={{
      background: 'rgba(3,8,20,0.75)', backdropFilter: 'blur(18px)',
      border: `1px solid ${feed.color}28`, borderRadius: 16, padding: 24,
      transition: 'border-color 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 16 }}>{feed.icon}</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: feed.color, letterSpacing: '0.09em', textTransform: 'uppercase' }}>
            {feed.label}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)', marginTop: 1 }}>
            {feed.description}
          </div>
        </div>
        <span style={{
          marginLeft: 'auto', fontSize: 8, fontWeight: 700, color: feed.color,
          background: `${feed.color}14`, border: `1px solid ${feed.color}30`,
          borderRadius: 4, padding: '2px 7px', letterSpacing: '0.07em',
        }}>
          ACTIVE
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {feed.indicators.map((ind) => (
          <div key={ind.label} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10, padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 16 }}>{ind.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
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

      <div style={{ marginTop: 12, fontSize: 9, color: 'rgba(255,255,255,0.16)', textAlign: 'right', letterSpacing: '0.06em' }}>
        DATA VIA API — COMING SOON
      </div>
    </div>
  )
}

// ─── News feed ────────────────────────────────────────────────────────────────
const TAG_COLORS = {
  MARKETS: '#3b82f6', ECONOMY: '#3b82f6', FINANCE: '#3b82f6', TRADE: '#3b82f6', CURRENCY: '#3b82f6',
  CONFLICT: '#ef4444', 'TRADE WAR': '#ef4444', ELECTIONS: '#f59e0b', ALLIANCES: '#6366f1', SANCTIONS: '#ef4444',
  CLIMATE: '#22c55e', REGULATION: '#f59e0b', ENERGY: '#22c55e', SOCIAL: '#14b8a6', GOVERNANCE: '#22c55e',
  AI: '#a78bfa', CYBER: '#ef4444', QUANTUM: '#a78bfa', PLATFORMS: '#6366f1',
  POLICY: '#f59e0b', COMPLIANCE: '#f59e0b', DATA: '#f59e0b', ENFORCEMENT: '#ef4444',
}

function NewsFeed({ feed }) {
  return (
    <div style={{
      background: 'rgba(3,8,20,0.75)', backdropFilter: 'blur(18px)',
      border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, padding: 24,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.09em', textTransform: 'uppercase' }}>
          📡 Intelligence Feed
        </div>
        <span style={{
          fontSize: 8, fontWeight: 700, color: '#f59e0b',
          background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.22)',
          borderRadius: 4, padding: '2px 7px', letterSpacing: '0.07em',
        }}>
          API PENDING
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {feed.news.map((item, idx) => (
          <div key={item.id} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10, padding: '10px 14px',
            opacity: 1 - idx * 0.07,
          }}>
            <div style={{ marginBottom: 4 }}>
              <span style={{
                fontSize: 8, fontWeight: 700,
                color: TAG_COLORS[item.tag] || '#6b7280',
                letterSpacing: '0.08em',
              }}>
                {item.tag}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.45 }}>
              {item.headline}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, fontSize: 9, color: 'rgba(255,255,255,0.16)', textAlign: 'right', letterSpacing: '0.06em' }}>
        CONNECT API TO POPULATE LIVE FEED
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function StormCloudPage() {
  const navigate     = useNavigate()
  const sev = useSeverity()

  const [activeFeedId, setActiveFeedId] = useState(FEEDS[0].id)
  const feed = FEEDS.find((f) => f.id === activeFeedId) || FEEDS[0]

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* Full-bleed background photo */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'url(/storm-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        backgroundRepeat: 'no-repeat',
      }} />

      {/* Dark vignette over photo so UI reads clearly */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'linear-gradient(to bottom, rgba(2,5,14,0.55) 0%, rgba(2,5,14,0.30) 35%, rgba(2,5,14,0.65) 70%, rgba(2,5,14,0.90) 100%)',
      }} />

      {/* Top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(2,5,14,0.70)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', padding: '0 24px', height: 56, gap: 16,
      }}>
        <button
          onClick={() => navigate('/island')}
          style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 8, color: 'rgba(255,255,255,0.60)', cursor: 'pointer',
            padding: '6px 14px', fontSize: 13,
          }}
        >
          ← Island
        </button>

        <div style={{
          fontSize: 15, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          background: 'linear-gradient(135deg, #93c5fd, #c4b5fd)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          ⛈ Storm Cloud
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em' }}>SEVERITY</span>
          <span style={{
            fontSize: 12, fontWeight: 700, color: sev.color,
            background: sev.bg, border: `1px solid ${sev.color}44`,
            borderRadius: 6, padding: '4px 12px', letterSpacing: '0.07em',
          }}>
            ● {sev.label}
          </span>
        </div>
      </div>

      {/* Content — scrollable, sits above the fixed bg layers */}
      <div style={{ position: 'relative', zIndex: 2, paddingTop: 56 }}>

        {/* Spacer so the Earth photo shows through at the top */}
        <div style={{ height: '22vh' }} />

        <FeedSelector activeFeedId={activeFeedId} onChange={setActiveFeedId} />

        <div style={{
          maxWidth: 1060, margin: '0 auto', padding: '0 24px 60px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20,
        }}>
          <PerceptionPanel feed={feed} />
          <NewsFeed feed={feed} />
        </div>
      </div>
    </div>
  )
}
