import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useIslandStore from '../store/islandStore.js'
import '../styles/island.css'

// ─── Intelligence feeds ───────────────────────────────────────────────────────
const FEEDS = [
  {
    id: 'market',
    icon: '📊',
    label: 'Market Intel',
    color: '#3b82f6',
    description: 'Financial markets & economic signals',
    indicators: [
      { icon: '💹', label: 'Market Sentiment',  value: 'Bearish',    color: '#ef4444', trend: '↓' },
      { icon: '📉', label: 'Volatility Index',  value: 'High',       color: '#ef4444', trend: '↑' },
      { icon: '🏦', label: 'Credit Conditions', value: 'Tightening', color: '#f59e0b', trend: '↓' },
      { icon: '💰', label: 'Liquidity',         value: 'Moderate',   color: '#f59e0b', trend: '→' },
      { icon: '📈', label: 'Growth Outlook',    value: 'Cautious',   color: '#f59e0b', trend: '→' },
      { icon: '🔄', label: 'Supply Chain',      value: 'Stable',     color: '#22c55e', trend: '→' },
    ],
    news: [
      { id: 1, tag: 'MARKETS',  headline: 'Global equities retreat as central banks signal higher-for-longer rates' },
      { id: 2, tag: 'ECONOMY',  headline: 'Manufacturing PMI contracts for third consecutive month across G7 nations' },
      { id: 3, tag: 'FINANCE',  headline: 'Corporate bond spreads widen amid rising default concerns in real estate sector' },
      { id: 4, tag: 'TRADE',    headline: 'Supply chain diversification accelerates as firms reduce single-country dependency' },
      { id: 5, tag: 'CURRENCY', headline: 'Dollar strengthens against emerging market currencies on Fed rate expectations' },
    ],
  },
  {
    id: 'geopolitics',
    icon: '🌍',
    label: 'Geopolitical',
    color: '#ef4444',
    description: 'Political stability & international relations',
    indicators: [
      { icon: '🌍', label: 'Global Stability',   value: 'Fragile',  color: '#ef4444', trend: '↓' },
      { icon: '⚔️', label: 'Conflict Index',     value: 'Elevated', color: '#ef4444', trend: '↑' },
      { icon: '🤝', label: 'Diplomatic Climate', value: 'Tense',    color: '#f59e0b', trend: '↓' },
      { icon: '🛢️', label: 'Resource Tensions',  value: 'High',     color: '#ef4444', trend: '↑' },
      { icon: '🗳️', label: 'Political Risk',     value: 'Moderate', color: '#f59e0b', trend: '→' },
      { icon: '🏳️', label: 'Alliance Strength',  value: 'Shifting', color: '#f59e0b', trend: '→' },
    ],
    news: [
      { id: 1, tag: 'CONFLICT',   headline: 'Regional tensions escalate as diplomatic talks stall over resource rights' },
      { id: 2, tag: 'TRADE WAR',  headline: 'New tariff barriers imposed on technology imports between major economies' },
      { id: 3, tag: 'ELECTIONS',  headline: 'Key election outcomes expected to reshape foreign policy across three regions' },
      { id: 4, tag: 'ALLIANCES',  headline: 'NATO members increase defence spending pledges amid eastern flank concerns' },
      { id: 5, tag: 'SANCTIONS',  headline: 'New sanction packages target financial infrastructure of key state actors' },
    ],
  },
  {
    id: 'esg',
    icon: '🌱',
    label: 'ESG & Climate',
    color: '#22c55e',
    description: 'Environmental, social & governance signals',
    indicators: [
      { icon: '🌡️', label: 'Climate Risk',       value: 'Critical',  color: '#ef4444', trend: '↑' },
      { icon: '♻️', label: 'Carbon Transition',  value: 'Lagging',   color: '#f59e0b', trend: '→' },
      { icon: '💧', label: 'Water Stress',       value: 'Regional',  color: '#f59e0b', trend: '↑' },
      { icon: '🏭', label: 'Emissions Targets',  value: 'On Track',  color: '#22c55e', trend: '→' },
      { icon: '👥', label: 'Social Index',       value: 'Improving', color: '#22c55e', trend: '↑' },
      { icon: '🏛️', label: 'Governance Score',   value: 'Strong',    color: '#22c55e', trend: '→' },
    ],
    news: [
      { id: 1, tag: 'CLIMATE',    headline: 'IPCC warns of accelerating tipping points as global temperatures breach records' },
      { id: 2, tag: 'REGULATION', headline: 'EU mandates real-time ESG disclosure for all listed companies from Q1' },
      { id: 3, tag: 'ENERGY',     headline: 'Renewable capacity additions outpace fossil fuel investment for second year' },
      { id: 4, tag: 'SOCIAL',     headline: 'Living wage movements reshape employer-stakeholder relationships across sectors' },
      { id: 5, tag: 'GOVERNANCE', headline: 'Board diversity requirements tighten as investor coalitions push for reform' },
    ],
  },
  {
    id: 'technology',
    icon: '⚡',
    label: 'Tech & Innovation',
    color: '#a78bfa',
    description: 'Disruption, AI & digital transformation',
    indicators: [
      { icon: '🤖', label: 'AI Adoption',       value: 'Rapid',     color: '#22c55e', trend: '↑' },
      { icon: '🔐', label: 'Cyber Risk',        value: 'Elevated',  color: '#ef4444', trend: '↑' },
      { icon: '📡', label: 'Digital Infra',     value: 'Expanding', color: '#22c55e', trend: '↑' },
      { icon: '⚖️', label: 'AI Regulation',     value: 'Emerging',  color: '#f59e0b', trend: '→' },
      { icon: '🚀', label: 'Innovation Index',  value: 'Strong',    color: '#22c55e', trend: '↑' },
      { icon: '📊', label: 'Tech Valuation',    value: 'Stretched', color: '#f59e0b', trend: '↑' },
    ],
    news: [
      { id: 1, tag: 'AI',         headline: 'Foundation model capabilities trigger new wave of enterprise automation cycles' },
      { id: 2, tag: 'CYBER',      headline: 'State-sponsored attacks on critical infrastructure double in twelve months' },
      { id: 3, tag: 'REGULATION', headline: 'G7 nations align on AI safety standards ahead of global governance summit' },
      { id: 4, tag: 'QUANTUM',    headline: 'Quantum computing breakthroughs accelerate timeline for cryptography disruption' },
      { id: 5, tag: 'PLATFORMS',  headline: 'Platform consolidation reshapes digital advertising and data broker ecosystems' },
    ],
  },
  {
    id: 'regulatory',
    icon: '🏛️',
    label: 'Regulatory',
    color: '#f59e0b',
    description: 'Policy, compliance & legal landscape',
    indicators: [
      { icon: '📋', label: 'Compliance Load',    value: 'Heavy',      color: '#ef4444', trend: '↑' },
      { icon: '⚖️', label: 'Litigation Risk',    value: 'Moderate',   color: '#f59e0b', trend: '→' },
      { icon: '🏦', label: 'Financial Reg.',     value: 'Tightening', color: '#f59e0b', trend: '↓' },
      { icon: '🔒', label: 'Data Privacy',       value: 'Evolving',   color: '#f59e0b', trend: '→' },
      { icon: '🌐', label: 'Cross-border Rules', value: 'Fragmented', color: '#ef4444', trend: '→' },
      { icon: '✅', label: 'Enforcement',        value: 'Increasing', color: '#ef4444', trend: '↑' },
    ],
    news: [
      { id: 1, tag: 'POLICY',      headline: 'New antitrust frameworks challenge platform dominance in five jurisdictions' },
      { id: 2, tag: 'COMPLIANCE',  headline: 'Mandatory sustainability reporting expands to mid-cap companies globally' },
      { id: 3, tag: 'DATA',        headline: 'Cross-border data transfer rules create operational challenges for multinationals' },
      { id: 4, tag: 'FINANCE',     headline: 'Basel IV implementation tightens capital requirements for tier-1 banks' },
      { id: 5, tag: 'ENFORCEMENT', headline: 'Record fines issued for GDPR violations signal new enforcement era in EU' },
    ],
  },
]

// ─── Severity helpers ─────────────────────────────────────────────────────────
const SEV = {
  high:     { label: 'HIGH',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  moderate: { label: 'MODERATE', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  low:      { label: 'LOW',      color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
}

function useSeverity(stakeholders) {
  return useMemo(() => {
    const getStatus = (s) => s.overall_status ?? s.climate?.overall_status ?? 'unknown'
    const crit = stakeholders.filter((s) => getStatus(s) === 'critical').length
    const att  = stakeholders.filter((s) => getStatus(s) === 'attention').length
    if (crit > 0) return { ...SEV.high,     crit, att }
    if (att  > 0) return { ...SEV.moderate,  crit, att }
    return           { ...SEV.low,          crit, att }
  }, [stakeholders])
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
  const stakeholders = useIslandStore((s) => s.stakeholders)
  const sev          = useSeverity(stakeholders)

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
        <div style={{ height: '42vh' }} />

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
