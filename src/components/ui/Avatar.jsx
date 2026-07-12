export default function Avatar({ name = '?', size = 36, src }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const colors = ['#3B82F6', '#14B8A6', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899']
  const color = colors[name.charCodeAt(0) % colors.length]

  const base = {
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    border: `2px solid ${color}`, overflow: 'hidden',
  }

  if (src) {
    return (
      <div style={base}>
        <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    )
  }

  return (
    <div style={{ ...base, background: color + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 600, color }}>
      {initials}
    </div>
  )
}
