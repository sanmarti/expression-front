export default function ProgressBar({ value, max, label, color = '#3B82F6' }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const warn = pct >= 90

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
          <span>{label}</span>
          <span style={{ color: warn ? '#EF4444' : 'rgba(255,255,255,0.55)' }}>
            {value} / {max}
          </span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: 8, background: '#1C2B45' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: warn ? '#EF4444' : color }}
        />
      </div>
    </div>
  )
}
