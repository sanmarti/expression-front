import { useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Campfire from './Campfire.jsx'
import { updateStakeholder } from '../../api/stakeholders.js'
import useIslandStore from '../../store/islandStore.js'

const STATUS_CFG = {
  favorable: { icon: '🟢', color: '#22c55e', label: 'Favorable' },
  attention:  { icon: '🟡', color: '#f59e0b', label: 'Attention' },
  critical:   { icon: '🔴', color: '#ef4444', label: 'Critical' },
  unknown:    { icon: '⚫', color: '#6b7280', label: 'Unknown' },
}

function ConditionsPanel({ stakeholders }) {
  const [open, setOpen] = useState(false)

  const counts = useMemo(() => {
    const c = { favorable: 0, attention: 0, critical: 0, unknown: 0 }
    stakeholders.forEach((s) => {
      const st = s.overall_status ?? s.climate?.overall_status ?? 'unknown'
      c[st] = (c[st] || 0) + 1
    })
    return c
  }, [stakeholders])

  const byStatus = useMemo(() => {
    const groups = { favorable: [], attention: [], critical: [], unknown: [] }
    stakeholders.forEach((s) => {
      const st = s.overall_status ?? s.climate?.overall_status ?? 'unknown'
      groups[st].push(s)
    })
    return groups
  }, [stakeholders])

  return (
    <div style={{
      position: 'absolute', top: 70, right: 16, zIndex: 40,
      background: 'rgba(11,17,32,0.88)', backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12,
      minWidth: 180,
    }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', padding: '10px 14px', background: 'none', border: 'none',
          cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center',
          color: 'rgba(255,255,255,0.80)', fontSize: 13, fontWeight: 600,
        }}
      >
        {['critical','attention','favorable','unknown'].map((st) => counts[st] > 0 && (
          <span key={st}>{STATUS_CFG[st].icon} {counts[st]}</span>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 10 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '8px 0' }}>
          {['critical','attention','favorable','unknown'].map((st) => (
            byStatus[st].length > 0 && (
              <div key={st}>
                <div style={{ padding: '4px 14px', fontSize: 11, color: STATUS_CFG[st].color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {STATUS_CFG[st].icon} {STATUS_CFG[st].label}
                </div>
                {byStatus[st].map((s) => (
                  <div key={s.id} style={{ padding: '3px 14px 3px 22px', fontSize: 12, color: 'rgba(255,255,255,0.70)' }}>
                    {s.name}
                  </div>
                ))}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  )
}

// Invisible click zones mapped to the photo's geography
const ZONES = [
  { id: 'mountain', d: 'M350,30 Q500,0 650,30 Q700,120 620,200 Q500,240 380,200 Q300,130 350,30 Z' },
  { id: 'forest',   d: 'M200,200 Q350,130 500,160 Q600,200 580,350 Q500,420 350,400 Q200,370 180,280 Z' },
  { id: 'jungle',   d: 'M580,160 Q720,130 820,200 Q860,300 800,400 Q700,450 600,400 Q560,320 580,160 Z' },
  { id: 'beach',    d: 'M200,450 Q400,500 650,470 Q750,430 780,520 Q500,590 180,530 Z' },
  { id: 'coast',    d: 'M100,300 Q160,200 250,180 Q200,320 200,450 Q130,400 100,300 Z' },
  { id: 'volcano',  d: 'M460,0 Q540,0 560,60 Q500,100 440,60 Z' },
]

export default function IslandMap({ onZoneClick }) {
  const navigate = useNavigate()
  const svgRef = useRef(null)
  const { stakeholders, updateStakeholderPosition } = useIslandStore()

  // drag state: { id, svgX, svgY } while dragging, null otherwise
  const [drag, setDrag] = useState(null)
  // track whether the pointer moved enough to be a drag vs a click
  const dragMoved = useRef(false)

  const getSVGPoint = (e) => {
    const svg = svgRef.current
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    return pt.matrixTransform(svg.getScreenCTM().inverse())
  }

  const handleCampMouseDown = (e, id) => {
    e.preventDefault()
    dragMoved.current = false
    const pt = getSVGPoint(e)
    setDrag({ id, svgX: pt.x, svgY: pt.y })
  }

  const handleSVGMouseMove = (e) => {
    if (!drag) return
    dragMoved.current = true
    const pt = getSVGPoint(e)
    setDrag((prev) => ({ ...prev, svgX: pt.x, svgY: pt.y }))
  }

  const handleSVGMouseUp = async (e) => {
    if (!drag) return
    const { id, svgX, svgY } = drag
    const wasDrag = dragMoved.current
    setDrag(null)
    dragMoved.current = false

    if (!wasDrag) {
      navigate(`/stakeholders/${id}`)
      return
    }

    const newX = Math.round(Math.max(0, Math.min(100, svgX / 10)))
    const newY = Math.round(Math.max(0, Math.min(100, svgY / 7)))

    updateStakeholderPosition(id, newX, newY)

    try {
      await updateStakeholder(id, { position_x: newX, position_y: newY })
    } catch {
      // silent — position stays optimistically updated
    }
  }

  const handleMapClick = (e, zoneId = null) => {
    if (dragMoved.current) return // don't open modal after a drag
    const pt = getSVGPoint(e)
    const pos = {
      x: Math.round(Math.max(0, Math.min(100, pt.x / 10))),
      y: Math.round(Math.max(0, Math.min(100, pt.y / 7))),
    }
    onZoneClick && onZoneClick(zoneId, pos)
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
    <svg
      ref={svgRef}
      viewBox="0 0 1000 700"
      width="100%"
      height="100vh"
      preserveAspectRatio="xMidYMid slice"
      style={{ display: 'block', cursor: drag ? 'grabbing' : 'crosshair' }}
      onMouseMove={handleSVGMouseMove}
      onMouseUp={handleSVGMouseUp}
      onMouseLeave={handleSVGMouseUp}
    >
      {/* Photo background */}
      <image
        href="/island.png"
        x="0" y="0"
        width="1000" height="700"
        preserveAspectRatio="xMidYMid slice"
      />

      {/* Dark overlay */}
      <rect width="1000" height="700" fill="rgba(0,0,0,0.18)" />

      {/* Fallback click area — whole map */}
      <rect
        width="1000" height="700"
        fill="transparent"
        onClick={(e) => handleMapClick(e, null)}
      />

      {/* Named zone overlays */}
      {ZONES.map((z) => (
        <path
          key={z.id}
          d={z.d}
          fill="transparent"
          onClick={(e) => { e.stopPropagation(); handleMapClick(e, z.id) }}
        />
      ))}

      {/* Campfire pins */}
      {stakeholders.map((s) => {
        const isDragging = drag?.id === s.id
        const displayed = isDragging
          ? { ...s, position_x: Math.round(drag.svgX / 10), position_y: Math.round(drag.svgY / 7) }
          : s

        return (
          <Campfire
            key={s.id}
            stakeholder={displayed}
            isDragging={isDragging}
            onMouseDown={(e) => handleCampMouseDown(e, s.id)}
          />
        )
      })}

      {/* Weather legend — bottom-left */}
      <foreignObject x="12" y="620" width="200" height="80">
        <div style={{
          background: 'rgba(11,17,32,0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, padding: '8px 12px',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.50)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
            Weather Legend
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 10px' }}>
            {Object.entries(STATUS_CFG).map(([st, cfg]) => (
              <div key={st} style={{ fontSize: 11, color: cfg.color, display: 'flex', gap: 4, alignItems: 'center' }}>
                {cfg.icon} {cfg.label}
              </div>
            ))}
          </div>
        </div>
      </foreignObject>
    </svg>

    {/* Conditions panel — HTML overlay, outside SVG */}
    <ConditionsPanel stakeholders={stakeholders} />
    </div>
  )
}
