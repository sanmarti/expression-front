export default function Avatar({ name = '?', size = 36 }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const colors = ['#3B82F6', '#14B8A6', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899']
  const color = colors[name.charCodeAt(0) % colors.length]

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color + '33',
        border: `2px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.36,
        fontWeight: 600,
        color,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}
