import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { INDICATORS, scoreColor } from '../constants/avatars.js'
import { getCockpitScore } from '../api/cockpit.js'

// Pentagon radar chart rendered in SVG
function RadarChart({ scores, size = 320 }) {
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

  const vals = INDICATORS.map((ind) => scores[ind.id]).filter((v) => v != null)
  const avg  = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null
  const avgColor = scoreColor(avg)

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(139,92,246,0.30)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0.08)" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Concentric grid pentagons */}
      {levels.map((lv) => (
        <polygon key={lv} points={poly(R * lv)}
          fill={lv === 1 ? 'rgba(255,255,255,0.02)' : 'none'}
          stroke={lv === 1 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'}
          strokeWidth={lv === 1 ? 1.5 : 1}
        />
      ))}

      {/* Level labels on top axis */}
      {levels.slice(0, -1).map((lv) => {
        const [x, y] = pt(0, R * lv)
        return (
          <text key={lv} x={x + 5} y={y + 3}
            fontSize={8} fill="rgba(255,255,255,0.22)" fontFamily="monospace">
            {Math.round(lv * 100)}
          </text>
        )
      })}

      {/* Axis lines */}
      {INDICATORS.map((ind, i) => {
        const [x, y] = pt(i, R)
        return (
          <line key={i} x1={cx} y1={cy} x2={x} y2={y}
            stroke={`${ind.color}44`} strokeWidth="1" strokeDasharray="3 3" />
        )
      })}

      {/* Data polygon */}
      <polygon points={dataPts}
        fill="url(#radarFill)"
        stroke="rgba(139,92,246,0.85)"
        strokeWidth="2"
        filter="url(#glow)"
      />

      {/* Score dots on each axis */}
      {INDICATORS.map((ind, i) => {
        const s = scores[ind.id] ?? 0
        const [x, y] = pt(i, (s / 100) * R)
        if (s === 0) return null
        return (
          <circle key={i} cx={x} cy={y} r={5}
            fill={ind.color}
            stroke="rgba(0,0,0,0.5)" strokeWidth="1.5"
            style={{ filter: `drop-shadow(0 0 5px ${ind.color})` }}
          />
        )
      })}

      {/* Center score */}
      {avg !== null && (
        <>
          <text x={cx} y={cy - 8} textAnchor="middle"
            fontSize={28} fontWeight={800} fill={avgColor}
            fontFamily="monospace"
            style={{ filter: `drop-shadow(0 0 8px ${avgColor}88)` }}>
            {avg}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle"
            fontSize={8} fill="rgba(255,255,255,0.30)" fontFamily="monospace" letterSpacing="2">
            AVG
          </text>
        </>
      )}
      {avg === null && (
        <text x={cx} y={cy + 6} textAnchor="middle"
          fontSize={14} fill="rgba(255,255,255,0.25)" fontFamily="monospace">
          —
        </text>
      )}
    </svg>
  )
}

// Tooltip placement per pentagon position (0=top, going clockwise)
const TOOLTIP_OFFSET = [
  { left: -90,  top:  84  },   // 0 top center  → below
  { left: -200, top:  10  },   // 1 upper right → left
  { left: -200, top:  -90 },   // 2 lower right → left + up
  { left:  80,  top:  -90 },   // 3 lower left  → right + up
  { left:  80,  top:  10  },   // 4 upper left  → right
]

function IndicatorNode({ indicator, score, x, y, idx }) {
  const [hovered, setHovered] = useState(false)
  const pct   = score ?? null
  const color = scoreColor(pct)
  const to    = TOOLTIP_OFFSET[idx]

  return (
    <div
      style={{ position: 'absolute', left: x - 36, top: y - 36, width: 72, height: 72, zIndex: 10 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Outer glow ring */}
      <div style={{
        position: 'absolute', inset: -6,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${indicator.color}18 0%, transparent 70%)`,
        transition: 'opacity 0.2s',
        opacity: hovered ? 1 : 0.5,
      }} />

      {/* Icon circle */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: `radial-gradient(circle at 38% 32%, ${indicator.color}28, rgba(4,8,20,0.90))`,
        border: `2px solid ${hovered ? indicator.color : indicator.color + '66'}`,
        boxShadow: hovered
          ? `0 0 28px ${indicator.color}55, 0 0 8px ${indicator.color}33`
          : `0 0 10px ${indicator.color}22`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'default',
        transition: 'all 0.18s',
        transform: hovered ? 'scale(1.14)' : 'scale(1)',
        backdropFilter: 'blur(12px)',
      }}>
        <span style={{ fontSize: 24, lineHeight: 1, filter: hovered ? `drop-shadow(0 0 6px ${indicator.color})` : 'none' }}>
          {indicator.icon}
        </span>
        <span style={{
          fontSize: 7, fontWeight: 800, letterSpacing: '0.07em', marginTop: 3,
          color: hovered ? indicator.color : `${indicator.color}bb`,
          fontFamily: 'monospace',
        }}>
          {indicator.label}
        </span>
      </div>

      {/* Score badge */}
      <div style={{
        position: 'absolute', bottom: -4, right: -4,
        width: 22, height: 22, borderRadius: '50%',
        background: 'rgba(4,8,20,0.95)',
        border: `1.5px solid ${pct !== null ? color : 'rgba(255,255,255,0.15)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 7, fontWeight: 800, color: pct !== null ? color : 'rgba(255,255,255,0.25)',
        fontFamily: 'monospace',
        boxShadow: pct !== null ? `0 0 8px ${color}55` : 'none',
      }}>
        {pct !== null ? pct : '·'}
      </div>

      {/* Tooltip */}
      {hovered && (
        <div style={{
          position: 'absolute',
          left: to.left, top: to.top,
          width: 200,
          background: 'rgba(4,8,20,0.96)',
          border: `1px solid ${indicator.color}55`,
          borderRadius: 12,
          padding: '12px 14px',
          boxShadow: `0 12px 40px rgba(0,0,0,0.8), 0 0 20px ${indicator.color}18`,
          backdropFilter: 'blur(20px)',
          zIndex: 30, pointerEvents: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>{indicator.icon}</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: indicator.color, letterSpacing: '0.06em' }}>
                {indicator.label}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
                {indicator.sublabel}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', lineHeight: 1.55, marginBottom: 10 }}>
            {indicator.description}
          </div>
          {/* Mini score bar */}
          <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct ?? 0}%`, borderRadius: 2,
              background: color,
              boxShadow: `0 0 6px ${color}`,
              transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ fontSize: 10, color: color, fontWeight: 700, fontFamily: 'monospace', marginTop: 5, textAlign: 'right' }}>
            {pct !== null ? `${pct} / 100` : 'Not filled yet'}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ArchetypesPage() {
  const navigate = useNavigate()
  const [scores, setScores] = useState({})

  useEffect(() => {
    getCockpitScore()
      .then(({ data }) => setScores(data.scores || data || {}))
      .catch(() => {})
  }, [])

  const SIZE   = 560   // layout container size
  const cx     = SIZE / 2
  const cy     = SIZE / 2
  const iconR  = 210   // pentagon radius for icon placement
  const n      = INDICATORS.length

  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>

      {/* Background image — save image to public/archetypes-bg.jpg */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'url(/archetypes-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        opacity: 0.35,
      }} />

      {/* Dark overlay for readability */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'radial-gradient(ellipse at 50% 45%, rgba(5,10,28,0.55) 0%, rgba(4,7,18,0.90) 100%)',
      }} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 680, padding: '28px 24px 0' }}>
        <button
          onClick={() => navigate('/cockpit')}
          style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 8, color: '#60A5FA', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, padding: '7px 16px',
            backdropFilter: 'blur(8px)', transition: 'all 0.15s',
          }}
        >
          ← My Cockpit
        </button>
      </div>

      {/* Title */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginTop: 20, marginBottom: 4 }}>
        <div style={{
          fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.22em',
          color: 'rgba(139,92,246,0.70)', marginBottom: 8, fontWeight: 700,
        }}>
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
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 6, letterSpacing: '0.03em' }}>
          Your five core energy fields — hover each node to explore
        </div>
      </div>

      {/* Main pentagon layout */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: SIZE, height: SIZE,
        flexShrink: 0,
      }}>
        {/* Radar chart centered */}
        <div style={{ position: 'absolute', left: cx - 160, top: cy - 160, pointerEvents: 'none' }}>
          <RadarChart scores={scores} size={320} />
        </div>

        {/* 5 icon nodes positioned at pentagon vertices */}
        {INDICATORS.map((ind, i) => {
          const angleRad = (2 * Math.PI * i / n) - Math.PI / 2
          const x = cx + iconR * Math.cos(angleRad)
          const y = cy + iconR * Math.sin(angleRad)
          return (
            <IndicatorNode
              key={ind.id}
              indicator={ind}
              score={scores[ind.id] ?? null}
              x={x} y={y}
              idx={i}
            />
          )
        })}
      </div>

      {/* Legend strip */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', gap: 20, marginTop: -20, marginBottom: 32,
        flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {INDICATORS.map((ind) => {
          const s   = scores[ind.id] ?? null
          const col = scoreColor(s)
          return (
            <div key={ind.id} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 14 }}>{ind.icon}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                {ind.label}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
                color: s !== null ? col : 'rgba(255,255,255,0.20)',
              }}>
                {s !== null ? s : '—'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
