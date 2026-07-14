import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { INDICATORS } from '../constants/avatars.js'
import { getCockpitScore } from '../api/cockpit.js'

const RAD_CFG = {
  confidence: { color: '#10B981', glow: '#10B981', label: 'Confidence', emoji: '🟢' },
  fear:       { color: '#EF4444', glow: '#EF4444', label: 'Fear',       emoji: '🔴' },
  null:       { color: 'rgba(255,255,255,0.28)', glow: 'transparent', label: 'Select', emoji: '○' },
}
const radCfg = (v) => RAD_CFG[v] || RAD_CFG['null']

// ── Radar chart ─────────────────────────────────────────────────────────────
function RadarChart({ scores, radiations, size = 320 }) {
  const [centerHovered, setCenterHovered] = useState(false)
  const cx = size / 2
  const cy = size / 2
  const R  = size * 0.37
  const n  = INDICATORS.length
  const levels = [0.2, 0.4, 0.6, 0.8, 1]

  const toRad = (i) => (2 * Math.PI * i / n) - Math.PI / 2
  const pt    = (i, r) => [cx + r * Math.cos(toRad(i)), cy + r * Math.sin(toRad(i))]
  const poly  = (r) => INDICATORS.map((_, i) => pt(i, r).join(',')).join(' ')

  const dataPts = INDICATORS.map((ind, i) => {
    const s = scores[ind.id] ?? 0
    return pt(i, (s / 100) * R).join(',')
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(99,102,241,0.28)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0.05)" />
        </radialGradient>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="hbGlow" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Grid pentagons */}
      {levels.map((lv) => (
        <polygon key={lv} points={poly(R * lv)}
          fill={lv === 1 ? 'rgba(255,255,255,0.015)' : 'none'}
          stroke={lv === 1 ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.06)'}
          strokeWidth={lv === 1 ? 1.5 : 1}
        />
      ))}

      {/* Axis lines colored by radiation */}
      {INDICATORS.map((ind, i) => {
        const [x, y] = pt(i, R)
        const col = radCfg(radiations[ind.id]).color
        return (
          <line key={i} x1={cx} y1={cy} x2={x} y2={y}
            stroke={col} strokeWidth="1" strokeOpacity="0.35" strokeDasharray="4 3" />
        )
      })}

      {/* Data polygon */}
      <polygon points={dataPts}
        fill="url(#radarFill)"
        stroke="rgba(99,102,241,0.75)"
        strokeWidth="2"
        filter="url(#softGlow)"
      />

      {/* Heartbeat pulses — travel from center to score along each axis */}
      {INDICATORS.map((ind, i) => {
        const s = scores[ind.id] ?? 0
        if (s === 0) return null
        const angle = toRad(i)
        const dx = (s / 100) * R * Math.cos(angle)
        const dy = (s / 100) * R * Math.sin(angle)
        const col = radCfg(radiations[ind.id]).color
        const dur = '3s'
        const begin = `${i * 0.65}s`
        const kt = '0; 0.45; 0.60; 1'
        const ks = '0.42 0 0.18 1; 0 0 1 1; 0 0 1 1'
        return (
          <g key={`hb-${i}`}>
            {/* Moving dot — shoots to score, pulses, fades out (no return) */}
            <circle r={3} fill={col} filter="url(#hbGlow)">
              <animate attributeName="cx" values={`${cx};${cx+dx};${cx+dx};${cx+dx}`} keyTimes={kt} keySplines={ks} calcMode="spline" dur={dur} begin={begin} repeatCount="indefinite" />
              <animate attributeName="cy" values={`${cy};${cy+dy};${cy+dy};${cy+dy}`} keyTimes={kt} keySplines={ks} calcMode="spline" dur={dur} begin={begin} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes={kt} dur={dur} begin={begin} repeatCount="indefinite" />
              <animate attributeName="r" values="3;7;8;3" keyTimes={kt} dur={dur} begin={begin} repeatCount="indefinite" />
            </circle>
            {/* Ripple ring that fires as dot arrives */}
            <circle cx={cx+dx} cy={cy+dy} fill="none" stroke={col} strokeWidth={1.5}>
              <animate attributeName="r"       values="0;0;5;20;20"       keyTimes="0;0.42;0.50;0.62;1" dur={dur} begin={begin} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0;0.85;0;0"      keyTimes="0;0.42;0.50;0.62;1" dur={dur} begin={begin} repeatCount="indefinite" />
              <animate attributeName="strokeWidth" values="2;2;1.5;0.5;0" keyTimes="0;0.42;0.50;0.62;1" dur={dur} begin={begin} repeatCount="indefinite" />
            </circle>
          </g>
        )
      })}

      {/* Score dots colored by radiation */}
      {INDICATORS.map((ind, i) => {
        const s = scores[ind.id] ?? 0
        if (s === 0) return null
        const [x, y] = pt(i, (s / 100) * R)
        const col = radCfg(radiations[ind.id]).color
        return (
          <circle key={i} cx={x} cy={y} r={6}
            fill={col}
            stroke="rgba(0,0,0,0.5)" strokeWidth="1.5"
            style={{ filter: `drop-shadow(0 0 6px ${col})` }}
          />
        )
      })}

      {/* Center interactive dot + tooltip */}
      <g
        onMouseEnter={() => setCenterHovered(true)}
        onMouseLeave={() => setCenterHovered(false)}
        style={{ cursor: 'default' }}
      >
        {/* Invisible hit area */}
        <circle cx={cx} cy={cy} r={16} fill="transparent" />
        {/* Visible dot */}
        <circle cx={cx} cy={cy} r={4}
          fill="rgba(99,102,241,0.60)"
          style={{ filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.8))' }}
        />
        {/* Tooltip */}
        {centerHovered && (
          <g>
            <rect
              x={cx - 52} y={cy - 34}
              width={104} height={22}
              rx={6} ry={6}
              fill="rgba(8,13,28,0.92)"
              stroke="rgba(99,102,241,0.45)"
              strokeWidth={1}
            />
            <text
              x={cx} y={cy - 19}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fontWeight="600"
              fill="rgba(255,255,255,0.80)"
              fontFamily="system-ui,-apple-system,sans-serif"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              Gota de Daat
            </text>
          </g>
        )}
      </g>
    </svg>
  )
}

// ── Tooltip offsets per pentagon position ────────────────────────────────────
const TOOLTIP_OFFSET = [
  { left: -100, top:  130 },   // 0 top center  → below
  { left: -215, top:   20 },   // 1 upper right → left
  { left: -215, top: -100 },   // 2 lower right → left + up
  { left:   85, top: -100 },   // 3 lower left  → right + up
  { left:   85, top:   20 },   // 4 upper left  → right
]

// ── Indicator node ───────────────────────────────────────────────────────────
function IndicatorNode({ indicator, score, x, y, idx, radiation, onSetRadiation, openDrop, onOpenDrop }) {
  const [hovered, setHovered] = useState(false)
  const nodeRef = useRef(null)

  const rad   = radCfg(radiation)
  const pct   = score ?? null
  const isOpen = openDrop === indicator.id
  const to    = TOOLTIP_OFFSET[idx]

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (nodeRef.current && !nodeRef.current.contains(e.target)) onOpenDrop(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, onOpenDrop])

  return (
    <div
      ref={nodeRef}
      style={{ position: 'absolute', left: x - 44, top: y - 44, width: 88, zIndex: isOpen ? 40 : 10 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Outer glow ring */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 88, height: 88,
        borderRadius: '50%',
        boxShadow: radiation
          ? `0 0 40px ${rad.color}44, 0 0 80px ${rad.color}18`
          : 'none',
        transition: 'box-shadow 0.3s',
        pointerEvents: 'none',
      }} />

      {/* Icon circle */}
      <div style={{
        width: 88, height: 88, borderRadius: '50%',
        background: radiation
          ? `radial-gradient(circle at 38% 32%, ${rad.color}22, rgba(4,8,20,0.92))`
          : 'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.06), rgba(4,8,20,0.92))',
        border: `2.5px solid ${radiation ? rad.color : 'rgba(255,255,255,0.22)'}`,
        boxShadow: hovered && radiation ? `0 0 24px ${rad.color}55` : 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'default',
        transition: 'all 0.22s',
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
        backdropFilter: 'blur(14px)',
      }}>
        <span style={{
          fontSize: 28, lineHeight: 1,
          filter: radiation && hovered ? `drop-shadow(0 0 8px ${rad.color})` : 'none',
          transition: 'filter 0.2s',
        }}>
          {indicator.icon}
        </span>
        <span style={{
          fontSize: 7, fontWeight: 800, letterSpacing: '0.08em', marginTop: 4,
          color: radiation ? rad.color : 'rgba(255,255,255,0.40)',
          fontFamily: 'monospace', transition: 'color 0.2s',
        }}>
          {indicator.label}
        </span>
      </div>

      {/* Big score pill */}
      <div style={{
        marginTop: 8, textAlign: 'center',
        fontSize: 22, fontWeight: 900,
        fontFamily: 'monospace', letterSpacing: '0.02em',
        color: radiation ? rad.color : 'rgba(255,255,255,0.35)',
        textShadow: radiation ? `0 0 12px ${rad.color}88` : 'none',
        transition: 'all 0.22s',
      }}>
        {pct !== null ? pct : '—'}
      </div>

      {/* Radiation selector */}
      <div style={{ marginTop: 6, position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={(e) => { e.stopPropagation(); onOpenDrop(isOpen ? null : indicator.id) }}
          style={{
            padding: '4px 10px', borderRadius: 20,
            background: radiation ? `${rad.color}18` : 'rgba(255,255,255,0.05)',
            border: `1px solid ${radiation ? rad.color + '55' : 'rgba(255,255,255,0.14)'}`,
            color: radiation ? rad.color : 'rgba(255,255,255,0.40)',
            fontSize: 10, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
            transition: 'all 0.15s', whiteSpace: 'nowrap',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{ fontSize: 9 }}>{rad.emoji}</span>
          {rad.label}
          <span style={{
            fontSize: 8, opacity: 0.6,
            display: 'inline-block',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s',
          }}>▾</span>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(4,8,20,0.97)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10, overflow: 'hidden',
              boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
              backdropFilter: 'blur(20px)',
              zIndex: 50, width: 130,
            }}
          >
            {[
              { value: 'confidence', color: '#10B981', emoji: '🟢', label: 'Confidence' },
              { value: 'fear',       color: '#EF4444', emoji: '🔴', label: 'Fear' },
            ].map(({ value, color, emoji, label }) => (
              <button
                key={value}
                onClick={() => { onSetRadiation(value); onOpenDrop(null) }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', border: 'none', cursor: 'pointer',
                  background: radiation === value ? `${color}18` : 'transparent',
                  borderLeft: `3px solid ${radiation === value ? color : 'transparent'}`,
                  color: radiation === value ? color : 'rgba(255,255,255,0.70)',
                  fontSize: 12, fontWeight: radiation === value ? 700 : 400,
                  transition: 'all 0.1s',
                }}
              >
                <span style={{ fontSize: 14 }}>{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hover tooltip */}
      {hovered && !isOpen && (
        <div style={{
          position: 'absolute',
          left: to.left, top: to.top,
          width: 210,
          background: 'rgba(4,8,20,0.97)',
          border: `1px solid ${radiation ? rad.color + '44' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 12, padding: '12px 15px',
          boxShadow: `0 16px 48px rgba(0,0,0,0.85)`,
          backdropFilter: 'blur(20px)',
          zIndex: 60, pointerEvents: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>{indicator.icon}</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: radiation ? rad.color : 'rgba(255,255,255,0.75)', letterSpacing: '0.06em' }}>
                {indicator.label}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
                {indicator.sublabel}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.68)', lineHeight: 1.55 }}>
            {indicator.description}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ArchetypesPage() {
  const navigate = useNavigate()
  const [scores, setScores] = useState({})
  const [openDrop, setOpenDrop] = useState(null)

  // Persist fear/confidence selections in localStorage
  const [radiations, setRadiations] = useState(() => {
    try { return JSON.parse(localStorage.getItem('archetypes_radiation') || '{}') }
    catch { return {} }
  })

  const setRadiation = (indicatorId, value) => {
    setRadiations((prev) => {
      const next = { ...prev, [indicatorId]: value }
      localStorage.setItem('archetypes_radiation', JSON.stringify(next))
      return next
    })
  }

  useEffect(() => {
    getCockpitScore()
      .then(({ data }) => setScores(data.scores || data || {}))
      .catch(() => {})
  }, [])

  // Close dropdowns when clicking on the page background
  const handlePageClick = () => setOpenDrop(null)

  const SIZE  = 560
  const cx    = SIZE / 2
  const cy    = SIZE / 2
  const iconR = 210
  const n     = INDICATORS.length

  return (
    <div
      onClick={handlePageClick}
      style={{ minHeight: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
    >
      {/* Background image — save to public/archetypes-bg.jpg */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'url(/archetypes-bg.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: 0.35,
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'radial-gradient(ellipse at 50% 45%, rgba(5,10,28,0.55) 0%, rgba(4,7,18,0.92) 100%)',
      }} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 680, padding: '28px 24px 0' }}>
        <button
          onClick={(e) => { e.stopPropagation(); navigate('/cockpit') }}
          style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 8, color: '#60A5FA', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, padding: '7px 16px', backdropFilter: 'blur(8px)',
          }}
        >
          ← My Cockpit
        </button>
      </div>

      {/* Title */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginTop: 20, marginBottom: 4 }}>
        <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.22em', color: 'rgba(139,92,246,0.70)', marginBottom: 8, fontWeight: 700 }}>
          EXPRESSION · SELF INTELLIGENCE
        </div>
        <h1 style={{
          fontSize: 34, fontWeight: 900, margin: 0, letterSpacing: '0.04em',
          background: 'linear-gradient(135deg, #c4b5fd 0%, #818cf8 40%, #60a5fa 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 20px rgba(139,92,246,0.4))',
        }}>
          My Archetypes
        </h1>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.30)', marginTop: 6 }}>
          Set each field to <span style={{ color: '#10B981', fontWeight: 600 }}>Confidence</span> or <span style={{ color: '#EF4444', fontWeight: 600 }}>Fear</span> — hover to explore
        </div>
      </div>

      {/* Main layout */}
      <div
        style={{ position: 'relative', zIndex: 2, width: SIZE, height: SIZE, flexShrink: 0, marginTop: 8 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Radar chart */}
        <div style={{ position: 'absolute', left: cx - 160, top: cy - 160, pointerEvents: 'none' }}>
          <RadarChart scores={scores} radiations={radiations} size={320} />
        </div>

        {/* 5 icon nodes */}
        {INDICATORS.map((ind, i) => {
          const angle = (2 * Math.PI * i / n) - Math.PI / 2
          const x = cx + iconR * Math.cos(angle)
          const y = cy + iconR * Math.sin(angle)
          return (
            <IndicatorNode
              key={ind.id}
              indicator={ind}
              score={scores[ind.id] ?? null}
              x={x} y={y} idx={i}
              radiation={radiations[ind.id] || null}
              onSetRadiation={(v) => setRadiation(ind.id, v)}
              openDrop={openDrop}
              onOpenDrop={setOpenDrop}
            />
          )
        })}
      </div>
    </div>
  )
}
