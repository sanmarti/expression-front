const presets = {
  blue: { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: 'rgba(59,130,246,0.3)' },
  teal: { bg: 'rgba(20,184,166,0.15)', color: '#14B8A6', border: 'rgba(20,184,166,0.3)' },
  amber: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: 'rgba(245,158,11,0.3)' },
  green: { bg: 'rgba(16,185,129,0.15)', color: '#10B981', border: 'rgba(16,185,129,0.3)' },
  red: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', border: 'rgba(239,68,68,0.3)' },
  gray: { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)', border: 'rgba(255,255,255,0.15)' },
}

export default function Badge({ children, variant = 'gray', style: extraStyle }) {
  const p = presets[variant] || presets.gray
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 10px',
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 500,
        background: p.bg,
        color: p.color,
        border: `1px solid ${p.border}`,
        ...extraStyle,
      }}
    >
      {children}
    </span>
  )
}
